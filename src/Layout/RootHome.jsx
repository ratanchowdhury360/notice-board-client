import { Outlet } from "react-router";
import Sidebar from "../Shared/Sidebar/Sidebar";
import Navber from "../Shared/Navbar/Navber";


const RootHome = () => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar (left) - Full height */}
      <div className="w-64 shrink-0 bg-gray-100">
        <Sidebar />
      </div>

      {/* Right side: Navbar + Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar (top) - Only above content area */}
        <Navber></Navber>

        {/* Outlet Content */}
        <div className="flex-1 bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RootHome;