import React from 'react';
import { Route } from 'react-router';

export default ({ code, children }) => (
  <Route render={({ staticContext }) => {
    if (staticContext) {
      // eslint-disable-next-line
      staticContext.status = code;
    }
    return children;
  }}
  />
);
