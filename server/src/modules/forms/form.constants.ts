export const FORM_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type FormStatus = (typeof FORM_STATUSES)[number];

export const FIELD_TYPES = [
  "TEXT",
  "EMAIL",
  "NUMBER",
  "PHONE",
  "TEXTAREA",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const OPTION_FIELD_TYPES: FieldType[] = [
  "SELECT",
  "RADIO",
  "CHECKBOX",
];
