import React from "react";

export default ({ info, error }) => {
  return (
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
};