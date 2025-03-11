import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Link } from "react-router-dom";
import { FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from "react-icons/fi";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="sidebar-content h-full flex flex-col">
      {/* Logo or Brand */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Echo</h2>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/dashboard"
          className="sidebar-item flex items-center gap-2"
        >
          Dashboard
        </Link>
        <Link
          to="/dashboard/requests"
          className="sidebar-item flex items-center gap-2"
        >
          Requests
        </Link>
        {/* Add more navigation items as needed */}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="sidebar-item flex items-center gap-2 w-full mb-4"
        >
          {darkMode ? (
            <>
              <FiSun className="h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <FiMoon className="h-4 w-4" />
              Dark Mode
            </>
          )}
        </button>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            {user?.name?.charAt(0) || "C"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || "Carson Crisp"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email || "cfcrisp@yahoo.com"}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Link
            to="/dashboard/profile"
            className="sidebar-item flex items-center gap-2 w-full"
          >
            <FiUser className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/dashboard/settings"
            className="sidebar-item flex items-center gap-2 w-full"
          >
            <FiSettings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={logout}
            className="sidebar-item flex items-center gap-2 w-full text-red-500 hover:text-red-600"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;