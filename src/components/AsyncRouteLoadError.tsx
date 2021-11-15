import { HttpStatus } from './Paw';
import { useLocation } from 'react-router-dom';
import { createPath } from 'history';

export default (props = {
  error: {
    message: '',
    stack: '',
  },
  info: {
    componentStack: '',
  },
}) => {
  const location = useLocation();
  const { error, info } = props;
  // You can render any custom fallback UI
  return (
    // @ts-ignore
    <HttpStatus statusCode={error?.getStatusCode?.() ?? 500}>
      <div>
        <h1>An error occurred while loading route: {createPath(location)}</h1>
        <h2>Error Stack:</h2>
        {!!error?.message && (
          <p>{error && error.message}</p>
        )}
        {!!error?.stack && (
          <code>
            <pre>
              {error && error.stack}
            </pre>
          </code>
        )}
        {!!info?.componentStack && (
          <>
            <h3>Component Stack:</h3>
            <code>
              <pre>
                {info && info.componentStack}
              </pre>
            </code>
          </>
        )}
      </div>
    </HttpStatus>
  );
};
