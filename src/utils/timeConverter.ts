type ParseDurationResult = {
  totalSeconds: number;
  formattedTime: string;
};

export const parseDurationToSeconds = (
  input: string | number,
): ParseDurationResult => {
  if (input === null || input === undefined) {
    throw new Error("Duration is required");
  }

  const value = String(input).trim();

  if (!value) {
    throw new Error("Duration is required");
  }

  /**
   * ==========================================
   * FORMAT 1: mm:ss
   * Examples:
   * 01:30
   * 1:30
   * ==========================================
   */
  const timeRegex = /^(\d{1,2}):([0-5]\d)$/;

  if (timeRegex.test(value)) {
    const match = value.match(timeRegex);

    if (!match) {
      throw new Error("Invalid time format");
    }

    const minutes = Number(match[1]);
    const seconds = Number(match[2]);

    const totalSeconds = minutes * 60 + seconds;

    return {
      totalSeconds,
      formattedTime: `${String(minutes).padStart(2, "0")}:${String(
        seconds,
      ).padStart(2, "0")}`,
    };
  }

  /**
   * ==========================================
   * FORMAT 2: Decimal minutes
   * Examples:
   * 1
   * 1.5
   * 1.9
   * ==========================================
   *
   * Only 1 decimal digit allowed
   */
  const decimalRegex = /^\d+(\.\d{1})?$/;

  if (!decimalRegex.test(value)) {
    throw new Error(
      "Invalid duration. Use mm:ss or decimal minutes with 1 decimal digit",
    );
  }

  const minutesValue = Number(value);

  if (!Number.isFinite(minutesValue) || minutesValue < 0) {
    throw new Error("Invalid duration value");
  }

  const totalSeconds = Math.round(minutesValue * 60);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    formattedTime: `${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`,
  };
};

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hrs, mins, secs].map((v) => v.toString().padStart(2, "0")).join(":");
};
