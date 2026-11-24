import { X } from "lucide-react";

import type { SubmissionDetail } from "../types/submission.types";

interface SubmissionDetailsModalProps {
  submission: SubmissionDetail;
  onClose: () => void;
}

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
};

const SubmissionDetailsModal = ({
  submission,
  onClose,
}: SubmissionDetailsModalProps) => {
  const sortedFields = [...submission.formSnapshot.fields].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Submission Details
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {submission.formSnapshot.name} · Version {submission.formVersion}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Submitted At
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>

          {sortedFields.map((field) => (
            <div key={field.id} className="border-b border-gray-100 pb-4">
              <p className="text-sm font-medium text-gray-700">
                {field.label}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                {formatValue(submission.data[field.key])}
              </p>
            </div>
          ))}

          <div className="text-xs text-gray-400">
            Submission ID: {submission._id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailsModal;