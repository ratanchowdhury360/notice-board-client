import { Outlet } from "react-router";
import { useState } from "react";
import Sidebar from "../Shared/Sidebar/Sidebar";
import Navber from "../Shared/Navbar/Navber";


const RootHome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen bg-white flex overflow-hidden">
      {/* Sidebar (left) - Full height - Hidden on mobile, visible on md and up */}
      <div className="hidden md:block md:w-64 lg:w-64 shrink-0 bg-gray-100">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-gray-100 z-50 transform transition-transform duration-300 md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>

      {/* Right side: Navbar + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar (top) - Only above content area */}
        <Navber sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Outlet Content */}
        <div className="flex-1 bg-white overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RootHome;