import { useState } from 'react';
import Navbar from './navbar';

const Layout = ({ children }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = '/login'; // redirect to login page
  };

  return (
    <div className="flex h-screen">
      {/* Navbar Component */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} handleLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Render the children (the content of the current page) */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
