import { useLocation } from 'react-router';
import Status from './RouteStatus';

export default () => {
  const { pathname } = useLocation();
  return (
    <Status code={404}>
      <div style={{ textAlign: 'center' }}>
        <h1>Page not found</h1>
        <h2 style={{ color: '#666' }}>{pathname}</h2>
        <small>We could not found the above page</small>
      </div>
    </Status>
  );
};
