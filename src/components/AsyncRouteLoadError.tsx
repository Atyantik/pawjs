import { HttpStatus } from './Paw';

export default (props = {
  error: {
    message: '',
    stack: '',
  },
  info: {
    componentStack: '',
  },
}) => {
  const { error, info } = props;
  return (
    <HttpStatus statusCode={500}>
      <div>
        <h1>A Server error has occurred</h1>
        <h2>Error Stack:</h2>
        <p>{error && error.message}</p>
        <code>
          <pre>
            {error && error.stack}
          </pre>
        </code>
        <h3>Component Stack:</h3>
        <code>
          <pre>
            {info && info.componentStack}
          </pre>
        </code>
      </div>
    </HttpStatus>
  );
};
