import React from 'react';

type ErrorProps = {
  error: {
    message: string,
    stack: string,
  },
  info: {
    componentStack: string,
  },
};

export default ({ error, info }: ErrorProps = {
  error: {
    message: '',
    stack: '',
  },
  info: {
    componentStack: '',
  },
}) => (
  <div>
    <h1>An error occurred</h1>
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
);
