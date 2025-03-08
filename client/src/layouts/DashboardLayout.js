import { useState } from "react"; // Already imported
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileHeader from "../components/MobileHeader";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar with dynamic width and transition */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:w-64`}
      >
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </aside>

      {/* Main Content with Overlay for Mobile */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header with Toggle Button */}
        <MobileHeader toggleSidebar={toggleSidebar} />

        {/* Main Content Area with Padding and Overlay */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 ${
            sidebarOpen ? "lg:ml-64" : "ml-0"
          } transition-all duration-300 ease-in-out`}
        >
          <div className={`min-h-screen ${sidebarOpen ? "lg:ml-64" : ""}`}>
            <Outlet />
          </div>
        </main>

        {/* Overlay for Mobile when Sidebar is Open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
      </div>
    </div>
  );
}

export default DashboardLayout;