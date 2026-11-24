import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import {
  useCreateFormMutation,
  useGetFormByIdQuery,
  useUpdateFormMutation,
} from "../api/formsApi";
import {
  FIELD_TYPE_OPTIONS,
  createDefaultField,
} from "../constants/field.constants";
import FieldOptionsEditor from "../components/FieldOptionsEditor";
import FieldValidationEditor from "../components/FieldValidationEditor";
import SortableField from "../components/SortableField";
import type { FormField, FormFieldType } from "../types/form.types";

const FormBuilderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const {
    data: existingFormResponse,
    isLoading: isFormLoading,
    isError: isFormError,
  } = useGetFormByIdQuery(id ?? "", {
    skip: !isEditMode,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  const [createForm, { isLoading: isCreating }] = useCreateFormMutation();

  const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    const form = existingFormResponse?.data;

    if (!form) return;

    setName(form.name);
    setDescription(form.description ?? "");
    setFields(form.fields);
  }, [existingFormResponse]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addField = () => {
    setFields((current) => [
      ...current,
      createDefaultField(current.length) as FormField,
    ]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    );
  };

  const changeFieldType = (id: string, type: FormFieldType) => {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== id) return field;

        const supportsOptions =
          type === "SELECT" || type === "RADIO" || type === "CHECKBOX";

        return {
          ...field,
          type,
          options: supportsOptions
            ? field.options?.length
              ? field.options
              : [
                  { label: "Option 1", value: "Option 1" },
                  { label: "Option 2", value: "Option 2" },
                ]
            : undefined,
        };
      }),
    );
  };

  const removeField = (id: string) => {
    setFields((current) =>
      current
        .filter((field) => field.id !== id)
        .map((field, index) => ({
          ...field,
          order: index,
        })),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setFields((current) => {
      const oldIndex = current.findIndex((field) => field.id === active.id);

      const newIndex = current.findIndex((field) => field.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return current;

      return arrayMove(current, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index,
      }));
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      window.alert("Please enter a form name.");
      return;
    }

    if (fields.length === 0) {
      window.alert("Please add at least one field.");
      return;
    }

    const normalizedFields = fields.map((field, index) => ({
      ...field,
      key: field.key.trim(),
      label: field.label.trim(),
      order: index,
    }));

    if (normalizedFields.some((field) => !field.label || !field.key)) {
      window.alert("Every field must have a label and key.");
      return;
    }

    const keys = normalizedFields.map((field) => field.key);
    if (new Set(keys).size !== keys.length) {
      window.alert("Each field must have a unique key.");
      return;
    }

    const optionFields = normalizedFields.filter((field) =>
      ["SELECT", "RADIO", "CHECKBOX"].includes(field.type),
    );

    for (const field of optionFields) {
      const options = field.options ?? [];

      if (
        options.length === 0 ||
        options.some((option) => !option.value.trim())
      ) {
        window.alert(`Please provide valid options for "${field.label}".`);
        return;
      }

      if (
        new Set(options.map((option) => option.value.trim())).size !==
        options.length
      ) {
        window.alert(`Duplicate options found in "${field.label}".`);
        return;
      }
    }

    for (const field of normalizedFields) {
      const rules = field.validations;

      if (
        rules?.minLength !== undefined &&
        rules.maxLength !== undefined &&
        rules.minLength > rules.maxLength
      ) {
        window.alert(
          `Minimum length cannot exceed maximum length in "${field.label}".`,
        );
        return;
      }

      if (
        rules?.min !== undefined &&
        rules.max !== undefined &&
        rules.min > rules.max
      ) {
        window.alert(
          `Minimum value cannot exceed maximum value in "${field.label}".`,
        );
        return;
      }

      if (rules?.pattern) {
        try {
          new RegExp(rules.pattern);
        } catch {
          window.alert(`Invalid regex pattern in "${field.label}".`);
          return;
        }
      }
    }

    try {
      if (isEditMode && id) {
        await updateForm({
          id,
          body: {
            name: name.trim(),
            description: description.trim(),
            fields: normalizedFields,
          },
        }).unwrap();
      } else {
        await createForm({
          name: name.trim(),
          description: description.trim(),
          fields: normalizedFields,
        }).unwrap();
      }

      navigate("/forms");
      toast.success(
        isEditMode
          ? "Form updated successfully"
          : "Form created successfully",
      );
    } catch {
      toast.error("Unable to save the form. Please try again.");
    }
  };

  if (isEditMode && isFormLoading) {
    return <div className="p-6">Loading form...</div>;
  }

  if (isEditMode && (isFormError || !existingFormResponse?.data)) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Unable to load this form. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/forms"
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Back to forms"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create a form
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your form and add the fields you need.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Form details</h2>

          <div>
            <label
              htmlFor="form-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Form name *
            </label>
            <input
              id="form-name"
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Employee Registration"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="form-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="form-description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the purpose of this form..."
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Form fields</h2>
              <p className="mt-1 text-sm text-gray-500">
                {fields.length} field{fields.length === 1 ? "" : "s"} added
              </p>
            </div>

            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              <Plus size={16} />
              Add field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <Plus size={25} className="mx-auto text-gray-400" />
              <h3 className="mt-3 font-semibold text-gray-800">
                No fields added yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start building your form by adding a field.
              </p>
              <button
                type="button"
                onClick={addField}
                className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Add your first field
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((field) => field.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <SortableField key={field.id} id={field.id}>
                      <article className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                      Field {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      aria-label={`Remove field ${index + 1}`}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`label-${field.id}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Field label *
                      </label>
                      <input
                        id={`label-${field.id}`}
                        required
                        value={field.label}
                        onChange={(event) =>
                          updateField(field.id, {
                            label: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`type-${field.id}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Field type
                      </label>
                      <select
                        id={`type-${field.id}`}
                        value={field.type}
                        onChange={(event) =>
                          changeFieldType(
                            field.id,
                            event.target.value as FormFieldType,
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                      >
                        {FIELD_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`key-${field.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Field key
                    </label>
                    <input
                      id={`key-${field.id}`}
                      required
                      value={field.key}
                      onChange={(event) =>
                        updateField(field.id, {
                          key: event.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "_"),
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Unique identifier used when storing responses.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`placeholder-${field.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Placeholder
                    </label>
                    <input
                      id={`placeholder-${field.id}`}
                      value={field.placeholder ?? ""}
                      onChange={(event) =>
                        updateField(field.id, {
                          placeholder: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  {["SELECT", "RADIO", "CHECKBOX"].includes(field.type) && (
                    <FieldOptionsEditor
                      field={field}
                      onChange={(options) => updateField(field.id, { options })}
                    />
                  )}

                  <FieldValidationEditor
                    field={field}
                    onChange={(validations) =>
                      updateField(field.id, { validations })
                    }
                  />

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) =>
                        updateField(field.id, {
                          required: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Required field
                  </label>
                      </article>
                    </SortableField>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            to="/forms"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving || fields.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving
              ? "Saving..."
              : isEditMode
                ? "Update Form"
                : "Save as draft"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBuilderPage;