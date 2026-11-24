import type { FormFieldType } from "../types/form.types";

export const FIELD_TYPE_OPTIONS: {
  label: string;
  value: FormFieldType;
}[] = [
  { label: "Short Text", value: "TEXT" },
  { label: "Email", value: "EMAIL" },
  { label: "Number", value: "NUMBER" },
  { label: "Phone", value: "PHONE" },
  { label: "Long Text", value: "TEXTAREA" },
  { label: "Date", value: "DATE" },
  { label: "Dropdown", value: "SELECT" },
  { label: "Radio Buttons", value: "RADIO" },
  { label: "Checkboxes", value: "CHECKBOX" },
];

export const createDefaultField = (
  index: number,
  type: FormFieldType = "TEXT",
) => ({
  id: crypto.randomUUID(),
  key: `field_${index + 1}`,
  label: `Question ${index + 1}`,
  type,
  placeholder: "",
  required: false,
  order: index,
  ...(type === "SELECT" || type === "RADIO" || type === "CHECKBOX"
    ? {
        options: [
          { label: "Option 1", value: "Option 1" },
          { label: "Option 2", value: "Option 2" },
        ],
      }
    : {}),
});