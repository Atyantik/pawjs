import React from 'react';
import { withRouter } from 'react-router';
import Status from './RouteStatus';

export default withRouter((props: { location: any }) => {
  const { location } = props;
  return (
    <Status code={404}>
      <div style={{ textAlign: 'center' }}>
        <h1>Page not found</h1>
        <h2 style={{ color: '#666' }}>{location.pathname}</h2>
        <small>We could not found the above page</small>
      </div>
    </Status>
  );
});
