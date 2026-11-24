import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  message = "Loading...",
  fullPage = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? "min-h-[60vh]" : "py-12"
      }`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}