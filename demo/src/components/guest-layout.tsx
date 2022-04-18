import Header from './header';
import Footer from './footer';
import React from 'react';

const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <Header />
    {children}
    <br />
    <Footer />
  </div>
);

export default GuestLayout;
