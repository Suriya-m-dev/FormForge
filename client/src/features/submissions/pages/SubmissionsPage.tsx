import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useGetFormsQuery } from "../../forms/api/formsApi";

import {
  useDeleteSubmissionMutation,
  useGetSubmissionByIdQuery,
  useGetSubmissionsQuery,
} from "../api/submissionsApi";

import SubmissionDetailsModal from "../components/SubmissionDetailsModal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

import type { SubmissionDetail } from "../types/submission.types";

const PAGE_SIZE = 10;

const SubmissionsPage = () => {
  const [selectedFormId, setSelectedFormId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSubmissionId, setSelectedSubmissionId] =
    useState<string | null>(null);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<string | null>(null);

  const {
    data: formsResponse,
    isLoading: isFormsLoading,
    isError: isFormsError,
    refetch: refetchForms,
  } = useGetFormsQuery({ page: 1, limit: 100 });

  const forms = formsResponse?.data.forms ?? [];

  const {
    data: submissionsResponse,
    isLoading: isSubmissionsLoading,
    isError,
    refetch,
  } = useGetSubmissionsQuery(
    {
      formId: selectedFormId,
      page,
      limit: PAGE_SIZE,
    },
    {
      skip: !selectedFormId,
    },
  );

  const [deleteSubmission, { isLoading: isDeleting }] =
    useDeleteSubmissionMutation();

  const {
    data: detailResponse,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetSubmissionByIdQuery(
      {
        formId: selectedFormId,
        submissionId: selectedSubmissionId ?? "",
      },
      {
        skip: !selectedFormId || !selectedSubmissionId,
      },
    );

  const submissions = submissionsResponse?.data.submissions ?? [];

  const pagination = submissionsResponse?.data.pagination;

  const handleFormChange = (formId: string) => {
    setSelectedFormId(formId);
    setPage(1);
    setSelectedSubmissionId(null);
  };

  const handleDelete = async (submissionId: string) => {
    try {
      await deleteSubmission({
        formId: selectedFormId,
        submissionId,
      }).unwrap();

      if (submissions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }

      setSubmissionToDelete(null);
      toast.success("Submission deleted successfully");
    } catch {
      toast.error("Unable to delete this submission. Please try again.");
    }
  };

  const selectedDetail = detailResponse?.data as
    | SubmissionDetail
    | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage responses received through your forms.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label
          htmlFor="submission-form"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Select Form
        </label>

        {isFormsError ? (
          <div>
            <p className="text-sm text-red-600">Unable to load forms.</p>
            <button
              type="button"
              onClick={() => void refetchForms()}
              className="mt-2 text-sm font-semibold text-indigo-600"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <select
              id="submission-form"
              value={selectedFormId}
              onChange={(event) => handleFormChange(event.target.value)}
              disabled={isFormsLoading}
              className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">
                {isFormsLoading ? "Loading forms..." : "Choose a form"}
              </option>

              {forms
                .filter((form) => form.status === "PUBLISHED")
                .map((form) => (
                  <option key={form._id} value={form._id}>
                    {form.name}
                  </option>
                ))}
            </select>

            {!isFormsLoading &&
              forms.filter((form) => form.status === "PUBLISHED").length ===
                0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No published forms available. Publish a form to view its
                  submissions.
                </p>
              )}
          </>
        )}
      </div>

      {!selectedFormId ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="font-medium text-gray-800">
            Select a form to view submissions
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Choose one of your published forms above.
          </p>
        </div>
      ) : isSubmissionsLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <LoadingSpinner message="Loading submissions..." />
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-white p-8 text-center">
          <p className="text-sm text-red-600">
            Unable to load submissions.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium text-indigo-600"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Form Responses
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {pagination?.total ?? 0} total submissions
              </p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="rounded-full bg-gray-100 p-4">
                <Eye size={24} className="text-gray-500" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No submissions yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Submissions received through this published form will appear
                here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Submission ID</th>
                      <th className="px-5 py-3">Version</th>
                      <th className="px-5 py-3">Submitted At</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="px-5 py-4 font-medium text-gray-800">
                          {submission._id.slice(-8)}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          v{submission.formVersion}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSubmissionId(submission._id)
                              }
                              aria-label="View submission"
                              className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() =>
                                setSubmissionToDelete(submission._id)
                              }
                              aria-label="Delete submission"
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
                <p className="text-xs text-gray-500">
                  Page {pagination?.page ?? page} of{" "}
                  {pagination?.totalPages ?? 1}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={page >= (pagination?.totalPages ?? 1)}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {selectedSubmissionId && isDetailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-xl bg-white p-6 shadow-xl">
            <LoadingSpinner message="Loading submission details..." />
          </div>
        </div>
      )}

      {selectedSubmissionId && isDetailError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
            <p className="font-semibold text-gray-900">
              Unable to load submission
            </p>
            <p className="mt-2 text-sm text-gray-500">Please try again.</p>
            <button
              type="button"
              onClick={() => setSelectedSubmissionId(null)}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedDetail && (
        <SubmissionDetailsModal
          submission={selectedDetail}
          onClose={() => setSelectedSubmissionId(null)}
        />
      )}

      <ConfirmDialog
        isOpen={submissionToDelete !== null}
        title="Delete submission?"
        message="Are you sure you want to delete this submission? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setSubmissionToDelete(null)}
        onConfirm={() => {
          if (submissionToDelete) {
            void handleDelete(submissionToDelete);
          }
        }}
      />
    </div>
  );
};

export default SubmissionsPage;