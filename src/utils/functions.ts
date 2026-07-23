import type {
  IBaseOperation,
  IFormattedUsage,
  IUpdatedSize,
  IUserData,
  IUserInfo,
  UnitType,
} from "../interfaces/interface";
import { formatBytes, slotOperation, toBytes } from "./sizeConverter";
import { formatDuration, parseDurationToSeconds } from "./timeConverter";

export const dynamicData = (
  user: IUserInfo,
  dataUnit: UnitType,
): IFormattedUsage => {
  const total = Number(user[dataUnit].total);
  const consumed = Number(user[dataUnit].consumed);
  const available = Number(user[dataUnit].available);

  if (dataUnit === "size") {
    return {
      total: formatBytes(total),
      consumed: formatBytes(consumed),
      available: formatBytes(available),
    };
  }

  return {
    total: formatDuration(total),
    consumed: formatDuration(consumed),
    available: formatDuration(available),
  };
};

export const buildPayload = (
  values: any,
  userInfo: IUserData,
): IUpdatedSize => {
  const { unit, opearation } = values;
  const isSize = unit === "size";

  const incomingValue = isSize
    ? toBytes(values.newSize, values.newUnit)
    : parseDurationToSeconds(values.newTime).totalSeconds;

  const config: IBaseOperation = {
    total: Number(userInfo[unit as UnitType].total) || 0,
    consumed: Number(userInfo[unit as UnitType].consumed) || 0,
    available: Number(userInfo[unit as UnitType].available) || 0,
    incomingValue,
    availableError: isSize
      ? "New value must be lesser than available size"
      : "Time exceeds the allowed time limitation",
  };

  if (opearation === "-") {
    if (config.incomingValue > config.available) {
      throw new Error(config.availableError);
    }
  }

  const { newTotalBytes, newAvailableBytes } = slotOperation({
    totalBytes: config.total,
    consumedBytes: config.consumed,
    newValueBytes: config.incomingValue,
    operation: opearation,
  });

  return {
    unit,
    userId: userInfo._id,
    newValue: newTotalBytes,
    newAvailableValue: newAvailableBytes,
  };
};

export const paginationPayload = { page: 1, limit: 10 };
