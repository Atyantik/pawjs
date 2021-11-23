import { Outlet } from 'react-router';
import GuestLayout from '../guest-layout';
import { Link } from 'react-router-dom';

const NestedRoute = () => {
  return (
    <GuestLayout>
      <div className="container p-2" style={{ minHeight: '20rem' }}>
        <h1 className="title mt-5">I am a nested Route</h1>
        <hr />
        <ul>
          <li>
            <Link to="/nested/simple">A simple route</Link>
          </li>
          <li>
            <Link to="/nested/john-doe">John Doe as param</Link>
          </li>
          <li>
            <Link to="/nested/cathrine">Cathrine as param</Link>
          </li>
        </ul>
        <hr />
        <Outlet />
      </div>

    </GuestLayout>
  );
};

export default NestedRoute;
