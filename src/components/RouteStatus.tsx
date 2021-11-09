import React from 'react';

export default (props: React.PropsWithChildren<{ code: number }>) => {
  const { children } = props;
  // Add reading of static context here for the throwing of the code
  // for SSR
  return children;
};
