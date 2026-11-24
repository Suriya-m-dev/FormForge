import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle } from "lucide-react";

import {
  useGetPublicFormQuery,
  useSubmitPublicFormMutation,
} from "../api/publicFormsApi";

import PublicFormField from "../components/PublicFormField";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

import type { SubmitFormRequest } from "../types/publicForm.types";

type FieldValue = string | number | string[];

const PublicFormPage = () => {
  const { formId } = useParams<{ formId: string }>();

  const { data, isLoading, isError } = useGetPublicFormQuery(formId ?? "", {
    skip: !formId,
  });

  const [submitForm, { isLoading: isSubmitting }] =
    useSubmitPublicFormMutation();

  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = data?.data;

  const handleFieldChange = (key: string, value: FieldValue) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!formId || !form) return;

    try {
      const submissionValues: SubmitFormRequest = {};

      form.fields.forEach((field) => {
        const value =
          values[field.key] ??
          (field.defaultValue as FieldValue | undefined);

        if (
          value !== undefined &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          submissionValues[field.key] = value;
        }
      });

      await submitForm({
        formId,
        values: submissionValues,
      }).unwrap();

      setIsSubmitted(true);
      setValues({});
    } catch (error) {
      const apiError = error as {
        data?: { message?: string };
      };

      setSubmitError(
        apiError.data?.message ??
          "Unable to submit the form. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading form..." fullPage />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Form unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This form may not exist, may have been archived, or may no longer
            be published.
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 size={36} className="text-green-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Response submitted!
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Thank you for taking the time to complete this form. Your response
            has been recorded successfully.
          </p>
        </div>
      </div>
    );
  }

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            FormForge
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            {form.name}
          </h1>
          {form.description && (
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {form.description}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label={`${form.name} submission form`}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {sortedFields.map((field) => (
            <PublicFormField
              key={field.id}
              field={field}
              value={
                values[field.key] ??
                (field.defaultValue as FieldValue | undefined) ??
                (field.type === "CHECKBOX" ? [] : "")
              }
              onChange={(value) => handleFieldChange(field.key, value)}
            />
          ))}

          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-700">
                Submission failed
              </p>
              <p className="mt-1 text-sm text-red-600">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <LoaderCircle size={17} className="animate-spin" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Powered by FormForge
          </p>
        </form>
      </div>
    </main>
  );
};

export default PublicFormPage;