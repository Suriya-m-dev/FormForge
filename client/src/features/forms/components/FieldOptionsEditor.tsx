import { Plus, Trash2 } from "lucide-react";
import type { FormField, FormFieldOption } from "../types/form.types";

interface FieldOptionsEditorProps {
  field: FormField;
  onChange: (options: FormFieldOption[]) => void;
}

const FieldOptionsEditor = ({
  field,
  onChange,
}: FieldOptionsEditorProps) => {
  const options = field.options ?? [];

  const updateOption = (index: number, label: string) => {
    onChange(
      options.map((option, optionIndex) =>
        optionIndex === index ? { label, value: label } : option,
      ),
    );
  };

  const addOption = () => {
    const label = `Option ${options.length + 1}`;

    onChange([...options, { label, value: label }]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, optionIndex) => optionIndex !== index));
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">
          Field options
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Add the choices users can select.
        </p>
      </div>

      {options.map((option, index) => (
        <div key={`${field.id}-option-${index}`} className="flex gap-2">
          <input
            value={option.label}
            onChange={(event) => updateOption(index, event.target.value)}
            aria-label={`Option ${index + 1}`}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
            placeholder={`Option ${index + 1}`}
          />

          <button
            type="button"
            onClick={() => removeOption(index)}
            disabled={options.length <= 1}
            aria-label={`Remove option ${index + 1}`}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addOption}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-950"
      >
        <Plus size={16} />
        Add option
      </button>
    </div>
  );
};

export default FieldOptionsEditor;