import React from 'react';
import { Route } from 'react-router';

export default (props) => {
  // eslint-disable-next-line
  const { code, children } = props;
  return (
    <Route render={({ staticContext }) => {
      if (staticContext) {
        // eslint-disable-next-line
        staticContext.status = code;
      }
      return children;
    }}
    />
  );
};
