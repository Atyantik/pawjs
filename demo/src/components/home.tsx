import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactLogo from './React PWA Image.png';

export default (props) => {
  const { loadedData } = props;
  console.log('Before: Home page mount -- demo/src/components/home.tsx');
  useEffect(() => {
    console.log('After: Home page mount -- demo/src/components/home.tsx');
  });

  if (loadedData.name.toLowerCase().indexOf('kirtan') !== -1) {
    console.log(loadedData.tirth.id);
  }
  return (
    <div>
      ReactPWA
      <br />
      <img src={ReactLogo} alt="react-pwa" />
      <br />
      - By
      {' '}
      {loadedData.name}
      <br />
      <Link to={loadedData.name.toLowerCase().indexOf('tirth') !== -1 ? '/page2' : '/'}>
        Change to Page 2
      </Link>
      <br />
      <Link to={loadedData.name.toLowerCase().indexOf('tirth') !== -1 ? '/page3' : '/'}>
        Change to Page 3
      </Link>
    </div>
  );
};
