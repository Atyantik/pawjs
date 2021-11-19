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
    <div>
      <h1>An error occurred</h1>
        <h2>Error Stack:</h2>
        {!!error?.message && (
          <p>{error.message}</p>
        )}
        {!!error?.stack && (
          <code>
            <pre>
              {error.stack}
            </pre>
          </code>
        )}
        {!!info?.componentStack && (
          <>
            <h3>Component Stack:</h3>
            <code>
              <pre>
                {info.componentStack}
              </pre>
            </code>
          </>
        )}
    </div>
  );
};
