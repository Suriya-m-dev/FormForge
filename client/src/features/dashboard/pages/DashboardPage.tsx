import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  FilePenLine,
  Archive,
  Plus,
  ArrowRight,
} from "lucide-react";

import { useGetFormsQuery } from "../../forms/api/formsApi";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const DashboardPage = () => {
  // Fetch recent forms
  const {
    data: formsResponse,
    isLoading: isFormsLoading,
    isError: isFormsError,
    refetch: refetchForms,
  } = useGetFormsQuery({
    page: 1,
    limit: 5,
  });

  // Fetch accurate status counts using server pagination metadata
  const {
    data: publishedResponse,
    isLoading: isPublishedLoading,
    isError: isPublishedError,
  } = useGetFormsQuery({
    page: 1,
    limit: 1,
    status: "PUBLISHED",
  });

  const {
    data: draftResponse,
    isLoading: isDraftLoading,
    isError: isDraftError,
  } = useGetFormsQuery({
    page: 1,
    limit: 1,
    status: "DRAFT",
  });

  const {
    data: archivedResponse,
    isLoading: isArchivedLoading,
    isError: isArchivedError,
  } = useGetFormsQuery({
    page: 1,
    limit: 1,
    status: "ARCHIVED",
  });

  const recentForms = formsResponse?.data.forms ?? [];

  const totalForms = formsResponse?.data.pagination.total ?? 0;
  const publishedForms = publishedResponse?.data.pagination.total ?? 0;
  const draftForms = draftResponse?.data.pagination.total ?? 0;
  const archivedForms = archivedResponse?.data.pagination.total ?? 0;

  const isStatsLoading =
    isPublishedLoading || isDraftLoading || isArchivedLoading;

  const isStatsError =
    isPublishedError || isDraftError || isArchivedError;

  const stats = [
    {
      title: "Total Forms",
      value: totalForms,
      icon: FileText,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      title: "Published Forms",
      value: publishedForms,
      icon: CheckCircle2,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      title: "Draft Forms",
      value: draftForms,
      icon: FilePenLine,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Archived Forms",
      value: archivedForms,
      icon: Archive,
      iconClass: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your forms and track their activity.
          </p>
        </div>

        <Link
          to="/forms/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={17} />
          Create Form
        </Link>
      </div>

      {/* Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <div className={`rounded-lg p-2 ${stat.iconClass}`}>
                    <Icon size={20} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold text-gray-900">
                  {isStatsLoading
                    ? "—"
                    : stat.title === "Total Forms"
                      ? totalForms
                      : isStatsError
                        ? "—"
                        : stat.value}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recent Forms */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Forms</h2>
            <p className="mt-1 text-xs text-gray-500">
              Your latest created and updated forms.
            </p>
          </div>

          <Link
            to="/forms"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        {isFormsLoading ? (
          <LoadingSpinner message="Loading recent forms..." />
        ) : isFormsError ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">
              Unable to load recent forms.
            </p>

            <button
              type="button"
              onClick={() => void refetchForms()}
              className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : recentForms.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={32} className="mx-auto text-gray-300" />
            <h3 className="mt-3 font-medium text-gray-800">
              No forms created yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first form to get started.
            </p>

            <Link
              to="/forms/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
            >
              <Plus size={16} />
              Create your first form
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentForms.map((form) => (
              <div
                key={form._id}
                className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {form.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {form.fields.length} fields · Updated{" "}
                    {new Date(form.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      form.status === "PUBLISHED"
                        ? "bg-green-50 text-green-700"
                        : form.status === "DRAFT"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {form.status}
                  </span>

                  <Link
                    to={
                      form.status === "PUBLISHED"
                        ? `/forms/${form._id}`
                        : form.status === "DRAFT"
                          ? `/forms/${form._id}/edit`
                          : "/forms"
                    }
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {form.status === "PUBLISHED"
                      ? "View form"
                      : form.status === "DRAFT"
                        ? "Edit"
                        : "View all"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;