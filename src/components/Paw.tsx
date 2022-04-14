import { Navigate, NavigateProps } from 'react-router';
import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
} from 'react';


const PawStaticContext: {
  redirect: NavigateProps,
  statusCode: number,
} = {
  redirect: {
    to: '',
  },
  statusCode: 200,
};

const PawInitialContext = {
  isInitialRender: () => true,
  setRedirect: () => {},
  setStatusCode: () => {},
  getStatusCode: () => 200,
  isStatusCodeChanged: () => false,
};

const PawContext = createContext<{
  isInitialRender: () => boolean,
  setRedirect: (args: NavigateProps, statusCode?: number) => void,
  setStatusCode: (code: number) => void,
  getStatusCode: () => number,
  isStatusCodeChanged: () => boolean,
}>(PawInitialContext);


/**
 * The utmost care that should be taken in PawContext is,
 * There should never be a re-render no matter what, PawContext is only for recording data
 * in a reference variable, and should never be used for re-rendering purpose.
 * @returns
 */
export const PawProvider: React.FC<{ staticContext?: any, children?: React.ReactNode }> = ({ children, staticContext = PawStaticContext }) => {
  const initialRender = useRef(true);
  const statusCodeChanged = useRef(false);
  useEffect(() => {
    initialRender.current = false;
  }, []);
  const isInitialRender = () => {
    return initialRender.current;
  };
  const setRedirect = (args: NavigateProps, statusCode = 302) => {
    Object.assign(staticContext, { redirect: args, statusCode });
  };
  const setStatusCode = (statusCode: number) => {
    Object.assign(staticContext, { statusCode });
    statusCodeChanged.current = true;
  };
  const getStatusCode = (): number => {
    return staticContext.statusCode;
  };
  const isStatusCodeChanged = () => {
    return statusCodeChanged.current;
  };
  return (
    <PawContext.Provider
      value={{
        isInitialRender,
        setRedirect,
        setStatusCode,
        getStatusCode,
        isStatusCodeChanged,
      }}
    >
      {children}
    </PawContext.Provider>
  );

};

const Redirect: React.FC<NavigateProps & { statusCode?: number }> = (props) => {
  const { isInitialRender, setRedirect } = useContext(PawContext);
  const { statusCode, ...navigationProps } = props;
  if (!isInitialRender()) {
    return (
      <Navigate {...navigationProps} />
    );
  } else {
    setRedirect(navigationProps, statusCode);
  }
  return null;

};


const HttpStatus: React.FC<{ children?: React.ReactElement, statusCode: number }> = (
  { children, statusCode },
) => {
  const {
    setStatusCode,
    getStatusCode,
    isStatusCodeChanged,
  } = useContext(PawContext);
  if (isStatusCodeChanged() && getStatusCode() !== statusCode) {
    console.error(`\nWARNING:: HTTP Status code was changed multiple times.\r\n -> Using latest mounted code as: ${statusCode}, previous status Code: ${getStatusCode()}\n`);
  }
  setStatusCode(statusCode);
  if (!children) return null;
  return children;
};

export { Redirect, HttpStatus };
