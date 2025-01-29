// components/Sidebar.jsx

import { Bars3Icon, HomeIcon, CubeIcon, ShoppingCartIcon, UserIcon, ChartBarIcon, PaperClipIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  return (
    <div>
      {/* Sidebar Overlay */}
      <div
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } fixed inset-0 bg-gray-800 bg-opacity-50 z-50 md:hidden`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed z-50 inset-y-0 left-0 w-64 bg-red-500 text-white transform transition-transform md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-4 mt-6">
          <h2 className="text-xl font-bold">Logo</h2>
          <Bars3Icon
            className="h-6 w-6 text-white cursor-pointer md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link href="/dashboard" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <HomeIcon className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/inventory" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <CubeIcon className="h-5 w-5" />
                Inventory
              </Link>
            </li>
            <li>
              <Link href="/orders" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <ShoppingCartIcon className="h-5 w-5" />
                Orders and Payments
              </Link>
            </li>
            <li>
              <Link href="/customers" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <UserIcon className="h-5 w-5" />
                Customers
              </Link>
            </li>
            <li>
              <Link href="/sales" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <ChartBarIcon className="h-5 w-5" />
                Sales Analytics
              </Link>
            </li>
            <li>
              <Link href="/marketing" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <PaperClipIcon className="h-5 w-5" />
                Marketing Tools
              </Link>
            </li>
            <li>
              <Link href="/settings" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
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
            className="block w-full text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3 px-6 py-4"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
