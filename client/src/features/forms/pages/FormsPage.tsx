import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Archive,
  Send,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  useGetFormsQuery,
  usePublishFormMutation,
  useArchiveFormMutation,
} from "../api/formsApi";

import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

import type { FormStatus } from "../types/form.types";

type FormConfirmation = {
  formId: string;
  action: "publish" | "archive";
} | null;

const PAGE_SIZE = 10;

const statusStyles: Record<FormStatus, string> = {
  DRAFT: "bg-amber-50 text-amber-700",
  PUBLISHED: "bg-green-50 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

const FormsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FormStatus | "">("");

  const [confirmation, setConfirmation] = useState<FormConfirmation>(null);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetFormsQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
  });

  const [publishForm, { isLoading: isPublishing }] = usePublishFormMutation();

  const [archiveForm, { isLoading: isArchiving }] = useArchiveFormMutation();

  const forms = response?.data.forms ?? [];
  const pagination = response?.data.pagination;

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as FormStatus | "");
    setPage(1);
  };

  const handlePublish = async (id: string) => {
    try {
      await publishForm(id).unwrap();

      toast.success("Form published successfully");
      setConfirmation(null);
    } catch {
      toast.error("Unable to publish this form. Please try again.");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveForm(id).unwrap();

      toast.success("Form archived successfully");
      setConfirmation(null);
    } catch {
      toast.error("Unable to archive this form. Please try again.");
    }
  };

  const handleCopyPublicLink = async (formId: string) => {
    const publicUrl = `${window.location.origin}/forms/${formId}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public form link copied!");
    } catch {
      toast.error("Unable to copy the link. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Forms</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your dynamic forms.
          </p>
        </div>

        <Link
          to="/forms/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          <Plus size={17} />
          Create form
        </Link>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex w-full gap-2 md:max-w-md">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search forms..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Search
            </button>
          </form>

          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-500"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {isError ? (
          <div className="p-10 text-center">
            <p className="font-medium text-red-600">Failed to load forms.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm font-semibold text-gray-900 underline"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <LoadingSpinner message="Loading forms..." />
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="rounded-full bg-gray-100 p-4">
              <FileText size={25} className="text-gray-500" />
            </div>

            <h2 className="mt-4 font-semibold text-gray-900">
              {search || status ? "No matching forms" : "No forms yet"}
            </h2>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              {search || status
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Create your first form to start collecting submissions."}
            </p>

            {search || status ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setStatus("");
                  setPage(1);
                }}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/forms/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
              >
                <Plus size={16} />
                Create your first form
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Form</th>
                    <th className="px-5 py-4 font-semibold">Fields</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Created</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {forms.map((form) => (
                    <tr key={form._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{form.name}</p>
                        <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                          {form.description || "No description"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {form.fields.length}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[form.status]}`}
                        >
                          {form.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {form.status !== "ARCHIVED" && (
                            <Link
                              to={`/forms/${form._id}/edit`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                              Edit
                            </Link>
                          )}

                          {form.status === "DRAFT" && (
                            <button
                              type="button"
                              title="Publish form"
                              disabled={isPublishing || isArchiving}
                              onClick={() =>
                                setConfirmation({
                                  formId: form._id,
                                  action: "publish",
                                })
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-700 disabled:opacity-40"
                            >
                              <Send size={16} />
                            </button>
                          )}

                          {form.status === "PUBLISHED" && (
                            <Link
                              to={`/forms/${form._id}`}
                              title="View public form"
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye size={16} />
                              View
                            </Link>
                          )}

                          {form.status === "PUBLISHED" && (
                            <button
                              type="button"
                              onClick={() => handleCopyPublicLink(form._id)}
                              title="Copy public form link"
                              aria-label="Copy public form link"
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                              <Copy size={16} />
                            </button>
                          )}

                          {form.status !== "ARCHIVED" && (
                            <button
                              type="button"
                              title="Archive form"
                              disabled={isPublishing || isArchiving}
                              onClick={() =>
                                setConfirmation({
                                  formId: form._id,
                                  action: "archive",
                                })
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                            >
                              <Archive size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {pagination
                  ? `Page ${pagination.page} of ${pagination.totalPages} · ${pagination.total} forms`
                  : `${forms.length} forms`}
                {isFetching && " · Updating..."}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination || page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="min-w-8 text-center text-sm font-medium text-gray-700">
                  {pagination?.page ?? page}
                </span>

                <button
                  type="button"
                  disabled={!pagination || page >= pagination.totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmation !== null}
        title={confirmation?.action === "publish" ? "Publish form?" : "Archive form?"}
        message={
          confirmation?.action === "publish"
            ? "Are you sure you want to publish this form? Users will be able to access and submit it."
            : "Are you sure you want to archive this form? It will no longer be available as an active form."
        }
        confirmText={confirmation?.action === "publish" ? "Publish" : "Archive"}
        variant={confirmation?.action === "publish" ? "primary" : "danger"}
        isLoading={isPublishing || isArchiving}
        onClose={() => setConfirmation(null)}
        onConfirm={() => {
          if (!confirmation) return;

          if (confirmation.action === "publish") {
            void handlePublish(confirmation.formId);
          } else {
            void handleArchive(confirmation.formId);
          }
        }}
      />
    </div>
  );
};

export default FormsPage;
