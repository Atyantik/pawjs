import React from 'react';
import { Route } from 'react-router';

export default (props: React.PropsWithChildren<{ code: number}>) => {
  const { code, children } = props;
  const routeRender = ({ staticContext }: any) => {
    if (staticContext) {
      staticContext.status = code;
    }
    return children;
  };
  return (
    <Route render={routeRender} />
  );
};
