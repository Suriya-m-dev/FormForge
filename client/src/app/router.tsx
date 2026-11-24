import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../routes/ProtectedRoute";
import GuestRoute from "../routes/GuestRoute";

import AppLayout from "../components/layout/AppLayout";

import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import FormsPage from "../features/forms/pages/FormsPage";
import FormBuilderPage from "../features/forms/pages/FormBuilderPage";
import PublicFormPage from "../features/forms/pages/PublicFormPage";
import SubmissionsPage from "../features/submissions/pages/SubmissionsPage";

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/forms",
            element: <FormsPage />,
          },
          {
            path: "/forms/new",
            element: <FormBuilderPage />,
          },
          {
            path: "/forms/:id/edit",
            element: <FormBuilderPage />,
          },
          {
            path: "/submissions",
            element: <SubmissionsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/forms/:formId",
    element: <PublicFormPage />,
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);