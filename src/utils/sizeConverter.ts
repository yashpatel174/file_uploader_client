type SizeUnit = "bytes" | "kb" | "mb" | "gb";

const UNIT_MAP: Record<SizeUnit, number> = {
  bytes: 1,
  kb: 1024,
  mb: 1024 ** 2,
  gb: 1024 ** 3,
};

/**
 * Convert size between units
 *
 * @param value - numeric value to convert
 * @param from - source unit
 * @param to - target unit
 * @param precision - decimal precision (default: 2)
 */
export const byteConverter = (
  value: number,
  from: SizeUnit,
  to: SizeUnit,
  precision = 2,
): string => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid value: must be a non-negative number");
  }

  const fromFactor = UNIT_MAP[from];
  const toFactor = UNIT_MAP[to];

  if (!fromFactor || !toFactor) {
    throw new Error("Invalid unit provided");
  }

  // Convert to bytes first (canonical form)
  const bytes = value * fromFactor;

  // Convert to target unit
  const result = bytes / toFactor;

  return `${Number(result.toFixed(precision))} ${to}`;
};

export const toBytes = (value: number, unit: SizeUnit): number => {
  // const parsed = typeof value === "string" ? Number(value.trim()) : value;
  if (Number.isNaN(value)) {
    throw new Error("Value must be an integer");
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid value: must be a non-negative number");
  }

  // 🔒 Validation
  // if (!Number.isFinite(parsed) || parsed < 0) {
  //   throw new Error("Invalid value: must be a non-negative number");
  // }

  const factor = UNIT_MAP[unit];
  if (!factor) {
    throw new Error(`Invalid unit: ${unit}`);
  }

  // ✅ Convert → round to avoid float precision issues
  return Math.round(value * factor);
};

export const slotOperation = (
  totalValue: number,
  availableValue: number,
  utilizedValue: number,
  newValue: number,
  operation: string,
) => {
  let newTotal = totalValue;

  if (operation === "+") {
    newTotal += newValue;
  }

  if (operation === "-") {
    if (newValue > availableValue) {
      throw new Error("New value cannot be greater than available size");
    }
    newTotal -= newValue;
  }
  const newAvailable = newTotal - utilizedValue;

  return { newTotal, newAvailable };
};

export const formatBytes = (bytes: number): string => {
  // Invalid number handling
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0.00 Bytes";
  }

  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  // GB
  if (bytes >= GB) {
    return `${(bytes / GB).toFixed(2)} GB`;
  }

  // MB
  if (bytes >= MB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  }

  // KB
  if (bytes >= KB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  }

  // Bytes
  return `${bytes.toFixed(2)} Bytes`;
};
