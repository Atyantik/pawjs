import React from 'react';

export default (props: React.PropsWithChildren<{ code: number }>) => {
  const { code, children } = props;
  return children;
};
