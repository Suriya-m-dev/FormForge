import type {
  FormField,
  FormFieldValidations,
} from "../types/form.types";

interface FieldValidationEditorProps {
  field: FormField;
  onChange: (validations: FormFieldValidations) => void;
}

const FieldValidationEditor = ({
  field,
  onChange,
}: FieldValidationEditorProps) => {
  const validations = field.validations ?? {};

  const updateNumber = (
    key: "minLength" | "maxLength" | "min" | "max",
    value: string,
  ) => {
    const next = { ...validations };

    if (value === "") {
      delete next[key];
    } else {
      const parsed = Number(value);

      if (
        !Number.isFinite(parsed) ||
        ((key === "minLength" || key === "maxLength") && parsed < 0)
      ) {
        return;
      }

      next[key] = parsed;
    }

    onChange(next);
  };

  const isTextField = ["TEXT", "EMAIL", "PHONE", "TEXTAREA"].includes(
    field.type,
  );

  const isNumberField = field.type === "NUMBER";

  if (!isTextField && !isNumberField) return null;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-800">
        Validation rules
      </h3>

      {isTextField && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`min-length-${field.id}`}
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Minimum length
            </label>
            <input
              id={`min-length-${field.id}`}
              type="number"
              min="0"
              value={validations.minLength ?? ""}
              onChange={(event) =>
                updateNumber("minLength", event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="No minimum"
            />
          </div>

          <div>
            <label
              htmlFor={`max-length-${field.id}`}
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Maximum length
            </label>
            <input
              id={`max-length-${field.id}`}
              type="number"
              min="0"
              value={validations.maxLength ?? ""}
              onChange={(event) =>
                updateNumber("maxLength", event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="No maximum"
            />
          </div>
        </div>
      )}

      {isNumberField && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`min-value-${field.id}`}
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Minimum value
            </label>
            <input
              id={`min-value-${field.id}`}
              type="number"
              value={validations.min ?? ""}
              onChange={(event) => updateNumber("min", event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="No minimum"
            />
          </div>

          <div>
            <label
              htmlFor={`max-value-${field.id}`}
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Maximum value
            </label>
            <input
              id={`max-value-${field.id}`}
              type="number"
              value={validations.max ?? ""}
              onChange={(event) => updateNumber("max", event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="No maximum"
            />
          </div>
        </div>
      )}

      {isTextField && (
        <div>
          <label
            htmlFor={`pattern-${field.id}`}
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Regex pattern (optional)
          </label>
          <input
            id={`pattern-${field.id}`}
            value={validations.pattern ?? ""}
            onChange={(event) =>
              onChange({
                ...validations,
                pattern: event.target.value || undefined,
              })
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
            placeholder="e.g. ^[A-Za-z]+$"
          />
          <p className="mt-1 text-xs text-gray-400">
            The backend will use this pattern to validate submitted values.
          </p>
        </div>
      )}
    </div>
  );
};

export default FieldValidationEditor;