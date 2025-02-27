import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, HomeIcon, CubeIcon, ShoppingCartIcon, UserIcon, ChartBarIcon, PaperClipIcon, CogIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import ConfirmationDialog from './confirmation-dialog'

const Navbar = ({ isNavbarOpen, setIsNavbarOpen }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pathname = usePathname(); // get the current route

  const handleLogout = () => {
    setIsDialogOpen(true); // show the confirmation dialog when logout is clicked
  };

  const handleConfirmLogout = () => {
    signOut({ callbackUrl: '/login' }); // log out the user and redirect to the login page
  };

  // function to determine if a link is active
  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <div>
      {/* Navbar Overlay */}
      <div
        className={`${
          isNavbarOpen ? 'block' : 'hidden'
        } fixed inset-0 bg-gray-800 bg-opacity-50 z-50 md:hidden`}
        onClick={() => setIsNavbarOpen(false)}
      ></div>

      {/* Navbar */}
      <div
        className={`${
          isNavbarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed z-50 inset-y-0 left-0 w-64 bg-blue-500 text-white transform transition-transform md:relative md:translate-x-0 h-full`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <h2 className="text-xl font-bold">Logo</h2>
          <Bars3Icon
            className="h-6 w-6 text-white cursor-pointer md:hidden"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
          />
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link
                href="/dashboard"
                className={`block px-6 py-6 text-lg text-white hover:border-l-4 hover:border-blue-500 transition-transform hover:font-bold flex items-center gap-3 ${
                  isActive('/dashboard') ? '!border-l-4 !border-white-400 font-bold' : ''
                }`}
              >
                <HomeIcon className="h-5 w-5" />
                Dashboard
              </Link>
            </li>

            <li>
              <Link 
                href="/inventory" 
                className={`block px-6 py-6 text-lg text-white hover:border-l-4 hover:border-blue-500 transition-transform hover:font-bold flex items-center gap-3 ${
                  isActive('/inventory') ? '!border-l-4 !border-white-400 font-bold' : ''
                }`}
              >
                <CubeIcon className="h-5 w-5" />
                Inventory
              </Link>
            </li>

            <li>
              <Link 
                href="/orders" 
                className={`block px-6 py-6 text-lg text-white hover:border-l-4 hover:border-blue-500 transition-transform hover:font-bold flex items-center gap-3 ${
                  isActive('/orders') ? '!border-l-4 !border-white-400 font-bold' : ''
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Orders and Payments
              </Link>
            </li>

            <li>
              <Link 
                href="/customers"
                className={`block px-6 py-6 text-lg text-white hover:border-l-4 hover:border-blue-500 transition-transform hover:font-bold flex items-center gap-3 ${
                  isActive('/customers') ? '!border-l-4 !border-white-400 font-bold' : ''
                }`}
              >
                <UserIcon className="h-5 w-5" />
                Customers
              </Link>
            </li>

            <li>
              <Link 
                href="/sales"
                className={`block px-6 py-6 text-lg text-white hover:border-l-4 hover:border-blue-500 transition-transform hover:font-bold flex items-center gap-3 ${
                  isActive('/sales') ? '!border-l-4 !border-white-400 font-bold' : ''
                }`}
              >
                <ChartBarIcon className="h-5 w-5" />
                Sales Analytics
              </Link>
            </li>

            <li>
              <Link 
                href="/marketing"
                className={`block px-6 py-6 text-lg text-white hover:border-l-4 hover:border-blue-500 transition-transform hover:font-bold flex items-center gap-3 ${
                  isActive('/marketing') ? '!border-l-4 !border-white-400 font-bold' : ''
                }`}
              >
                <PaperClipIcon className="h-5 w-5" />
                Marketing Tools
              </Link>
            </li>

            <li>
              <Link 
                href="/settings"
                className={`block px-6 py-6 text-lg text-white hover:border-l-4 hover:border-blue-500 transition-transform hover:font-bold flex items-center gap-3 ${
                  isActive('/settings') ? '!border-l-4 !border-white-400 font-bold' : ''
                }`}
              >
                <CogIcon className="h-5 w-5" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="block w-full text-lg text-white hover:border-l-4 border-blue-500 transition-transform hover:font-bold flex items-center gap-3 px-6 py-6"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        message="Are you sure you want to log out of eBikri?"
      />
    </div>
  );
};

export default Navbar;
