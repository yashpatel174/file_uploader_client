export const username = [
  {
    required: true,
    message: "Username is required",
  },
  {
    pattern: /^(?!\s)(.*\S)?$/,
    message: "Leading and trailing spaces are not allowed",
  },
  {
    pattern: /^\S+$/,
    message: "Spaces are not allowed",
  },
  {
    pattern: /^[a-z0-9._]+$/,
    message:
      "Only small letters, numbers, dot (.) and underscore (_) are allowed",
  },
  {
    pattern: /^(?=.*[a-z]).+$/,
    message: "At least one lowercase letter is required",
  },
  {
    pattern: /^(?=.*([0-9]|[_.])).+$/,
    message: "At least one number or special character (_, .) is required",
  },
  {
    pattern: /^.{3,15}$/,
    message: "Must be between 3 and 15 characters",
  },
];

export const fileSize = [
  {
    required: true,
    message: "Size limit is required",
  },
  {
    pattern: /^(?!\s)(.*\S)?$/,
    message: "Leading and trailing spaces are not allowed",
  },
  {
    pattern: /^\S+$/,
    message: "Spaces are not allowed",
  },
  { pattern: /^\d+$/, message: "Only numbers are allowed" },
];

export const unitValidation = [
  {
    required: true,
    message: "Unit is required",
  },
];

export const timeValidation = [
  {
    required: true,
    message: "Time is required",
  },
  {
    pattern: /^(?!\s)(.*\S)?$/,
    message: "Leading and trailing spaces are not allowed",
  },
  {
    pattern: /^\S+$/,
    message: "Spaces are not allowed",
  },

  // Only digits before decimal/colon
  {
    pattern: /^\d+([.:]\d+)?$/,
    message:
      "Only numbers are allowed with optional single decimal or time format",
  },

  // Decimal validation => only 1 digit after decimal
  {
    pattern: /^(?!.*\..*\.)\d+(\.\d{1})?$|^\d+:\d{2}$/,
    message:
      "Enter either a single digit after decimal or exactly 2 digits after colon",
  },
];
