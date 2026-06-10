import type {
  ConvertSizeOptions,
  ISlotOperation,
  SizeUnit,
} from "../interfaces/interface";

const UNIT_MAP: Record<SizeUnit, number> = {
  Bytes: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
};

export const toBytes = (value: number, unit: SizeUnit): number => {
  if (!unit) throw new Error("Unit is required");
  if (Number.isNaN(value)) throw new Error("Value must be a valid number");

  if (value < 0) {
    throw new Error("Invalid value: must be a non-negative number");
  }

  const factor = UNIT_MAP[unit];
  if (factor === undefined) throw new Error(`Invalid unit: ${unit}`);

  // ✅ Convert → round to avoid float precision issues
  return Math.round(value * factor);
};

export const slotOperation = ({
  totalBytes,
  consumedBytes,
  newValueBytes,
  operation,
}: ISlotOperation) => {
  let newTotalBytes = totalBytes;

  const availableBytes = totalBytes - consumedBytes;
  if (operation === "+") newTotalBytes += newValueBytes;
  if (operation === "-") {
    if (newValueBytes > availableBytes) {
      throw new Error(
        `Cannot reduce more than available size (${formatBytes(availableBytes)})`,
      );
    }
    newTotalBytes -= newValueBytes;
  }

  return {
    newTotalBytes,
    newAvailableBytes: newTotalBytes - consumedBytes,
  };
};

export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";

  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(2)} KB`;

  return `${bytes} Bytes`;
};

// ===========================================================================================================
// ================================================ UPDATED ==================================================
// ===========================================================================================================

export const convertSize = (
  value: number,
  fromUnit: SizeUnit,
  toUnit: SizeUnit,
  options: ConvertSizeOptions = {},
): number | string => {
  const { precision = 2, formatted = false } = options;

  // 🔒 Validation
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Value must be a non-negative finite number");
  }

  if (!UNIT_MAP[fromUnit]) {
    throw new Error(`Invalid fromUnit: ${fromUnit}`);
  }

  if (!UNIT_MAP[toUnit]) {
    throw new Error(`Invalid toUnit: ${toUnit}`);
  }

  // ✅ Step 1: Convert -> bytes
  const bytes = value * UNIT_MAP[fromUnit];

  // ✅ Step 2: Convert bytes -> target unit
  const converted = bytes / UNIT_MAP[toUnit];

  // ✅ Avoid floating precision issues
  const rounded = Number(converted.toFixed(precision));

  return formatted ? `${rounded.toFixed(precision)} ${toUnit}` : rounded;
};
