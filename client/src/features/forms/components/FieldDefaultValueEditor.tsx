import type { FormField } from "../types/form.types";

interface FieldDefaultValueEditorProps {
  field: FormField;
  onChange: (defaultValue: FormField["defaultValue"]) => void;
}

const FieldDefaultValueEditor = ({ field, onChange }: FieldDefaultValueEditorProps) => {
  const inputId = `default-value-${field.id}`;
  const options = field.options ?? [];

  if (field.type === "SELECT" || field.type === "RADIO") {
    const value = typeof field.defaultValue === "string" ? field.defaultValue : "";

    return (
      <div>
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-700">
          Default value
        </label>
        <select
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value || undefined)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
        >
          <option value="">No default value</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "CHECKBOX") {
    const selectedValues = Array.isArray(field.defaultValue)
      ? field.defaultValue.filter((value): value is string => typeof value === "string")
      : [];

    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Default selections</legend>
        <p className="text-xs text-gray-500">
          Select the options that should be checked initially.
        </p>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(event) => {
                const nextValues = event.target.checked
                  ? [...selectedValues, option.value]
                  : selectedValues.filter((value) => value !== option.value);

                onChange(nextValues.length > 0 ? nextValues : undefined);
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }

  const isNumber = field.type === "NUMBER";
  const isDate = field.type === "DATE";
  const value =
    isNumber && typeof field.defaultValue === "number"
      ? field.defaultValue
      : !isNumber && typeof field.defaultValue === "string"
        ? field.defaultValue
        : "";

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-700">
        Default value
      </label>
      <input
        id={inputId}
        type={isNumber ? "number" : isDate ? "date" : "text"}
        value={value}
        min={isNumber ? field.validations?.min : undefined}
        max={isNumber ? field.validations?.max : undefined}
        minLength={!isNumber ? field.validations?.minLength : undefined}
        maxLength={!isNumber ? field.validations?.maxLength : undefined}
        onChange={(event) => {
          if (event.target.value === "") {
            onChange(undefined);
            return;
          }

          onChange(isNumber ? Number(event.target.value) : event.target.value);
        }}
        placeholder={isDate ? undefined : "Leave blank for no default"}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
      />
    </div>
  );
};

export default FieldDefaultValueEditor;
