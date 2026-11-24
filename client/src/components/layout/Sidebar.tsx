import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Sparkles,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Forms",
    path: "/forms",
    icon: FileText,
  },
  {
    name: "Submissions",
    path: "/submissions",
    icon: Inbox,
  },
];

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
          <Sparkles size={19} />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          FormForge
        </span>
      </div>

      <div className="px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-200 p-4">
        <p className="text-xs text-gray-400">FormForge</p>
        <p className="mt-1 text-sm font-medium text-gray-700">
          Form Management Platform
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;