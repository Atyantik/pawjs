import Header from './header';
import Footer from './footer';

const GuestLayout: React.FC = ({ children }) => (
  <div>
    <Header />
    {children}
    <br />
    <Footer />
  </div>
);

export default GuestLayout;
