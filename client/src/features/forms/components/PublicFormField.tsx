import type { FormField } from "../types/form.types";

type FieldValue = string | number | string[];

interface PublicFormFieldProps {
  field: FormField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const PublicFormField = ({
  field,
  value,
  onChange,
}: PublicFormFieldProps) => {
  const options = field.options ?? [];
  const inputId = `field-${field.id}`;

  const renderInput = () => {
    switch (field.type) {
      case "TEXT":
      case "EMAIL":
      case "PHONE":
        return (
          <input
            id={inputId}
            type={
              field.type === "EMAIL"
                ? "email"
                : field.type === "PHONE"
                  ? "tel"
                  : "text"
            }
            value={String(value)}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validations?.minLength}
            maxLength={field.validations?.maxLength}
            pattern={field.validations?.pattern}
            onChange={(event) => onChange(event.target.value)}
            className={inputClassName}
          />
        );

      case "NUMBER":
        return (
          <input
            id={inputId}
            type="number"
            value={String(value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validations?.min}
            max={field.validations?.max}
            onChange={(event) =>
              onChange(
                event.target.value === ""
                  ? ""
                  : Number(event.target.value),
              )
            }
            className={inputClassName}
          />
        );

      case "TEXTAREA":
        return (
          <textarea
            id={inputId}
            value={String(value)}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validations?.minLength}
            maxLength={field.validations?.maxLength}
            rows={4}
            onChange={(event) => onChange(event.target.value)}
            className={inputClassName}
          />
        );

      case "DATE":
        return (
          <input
            id={inputId}
            type="date"
            value={String(value)}
            required={field.required}
            onChange={(event) => onChange(event.target.value)}
            className={inputClassName}
          />
        );

      case "SELECT":
        return (
          <select
            id={inputId}
            value={String(value)}
            required={field.required}
            onChange={(event) => onChange(event.target.value)}
            className={inputClassName}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "RADIO":
        return (
          <div
            className="space-y-3"
            role="group"
            aria-label={field.label}
            aria-required={field.required}
          >
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  required={field.required}
                  onChange={() => onChange(option.value)}
                  className="h-4 w-4 accent-indigo-600"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case "CHECKBOX":
        return (
          <div
            className="space-y-3"
            role="group"
            aria-label={field.label}
            aria-required={field.required}
          >
            {options.map((option) => {
              const selectedValues = Array.isArray(value) ? value : [];

              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    required={
                      field.required &&
                      options.length > 0 &&
                      selectedValues.length === 0
                    }
                    onChange={(event) => {
                      const updatedValues = event.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(
                            (item) => item !== option.value,
                          );

                      onChange(updatedValues);
                    }}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <p className="text-sm text-red-600">
            Unsupported field type.
          </p>
        );
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={
          field.type === "RADIO" || field.type === "CHECKBOX"
            ? undefined
            : inputId
        }
        className="block text-sm font-medium text-gray-800"
      >
        {field.label}
        {field.required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {renderInput()}
    </div>
  );
};

export default PublicFormField;