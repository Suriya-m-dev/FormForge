import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="min-h-screen px-5 pb-8 pt-24 md:ml-64 md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;