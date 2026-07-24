// The `education_level` enum, in teaching order. Shared by the manuscript
// details drawer (where it's chosen) and Collaborate (where it's filtered on).
export const EDUCATION_LEVELS = [
  { value: "preschool", label: "Preschool" },
  { value: "kindergarten", label: "Kindergarten" },
  { value: "high_school", label: "High School" },
  { value: "undergrad", label: "Undergrad" },
  { value: "grad", label: "Grad" },
];

export const educationLabel = (value) =>
  EDUCATION_LEVELS.find((l) => l.value === value)?.label ?? null;
