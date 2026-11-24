import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../features/auth/api/authApi";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAppDispatch } from "../../app/hooks";
import { baseApi } from "../../app/baseApi";

const Topbar = () => {
  const { user } = useAuth();
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Continue local logout even if the API request fails.
    } finally {
      dispatch(baseApi.util.resetApiState());
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5 md:left-64 md:px-8">
      <div>
        <p className="text-sm font-medium text-gray-900">
          Admin Workspace
        </p>
        <p className="hidden text-xs text-gray-500 sm:block">
          Manage your forms and submissions
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-gray-800">
            {user?.name ?? "Admin"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.email}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">
            {isLoading ? "Signing out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;