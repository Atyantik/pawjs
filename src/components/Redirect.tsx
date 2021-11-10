import { Navigate, NavigateProps } from 'react-router';
import { createContext, useContext, useRef, useEffect } from 'react';

export const RedirectContext = createContext<NavigateProps & { isInitialRender: () => boolean, setRedirect: (args: NavigateProps) => void }>({
  to: '',
  isInitialRender: () => true,
  setRedirect: () => {},
});


export const RedirectProvider: React.FC<{ staticContext?: any }> = ({ children, staticContext = {} }) => {
  const initialRender = useRef(true);
  useEffect(() => {
    initialRender.current = false;
  }, []);
  const isInitialRender = () => {
    return initialRender.current;
  };
  const setRedirect = (args: NavigateProps) => {
    Object.assign(staticContext, args);
  };
  return (
    <RedirectContext.Provider
      value={{
        to: '',
        isInitialRender,
        setRedirect,
      }}
    >
      {children}
    </RedirectContext.Provider>
  );

};

const Redirect: React.FC<NavigateProps> = (props) => {
  const { isInitialRender, setRedirect } = useContext(RedirectContext);
  console.log('You want to redirect to: ', props?.to);
  if (!isInitialRender()) {
    return (
      <Navigate {...props} />
    );
  } else {
    console.log('I am initial render set the redirect');
    setRedirect(props);
  }
  return null;

};

export { Redirect };
