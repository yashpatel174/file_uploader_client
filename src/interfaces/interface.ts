export interface IUserTableHeader {
  action?: string;
  _id: string;
  id: number;
  userName: string;
  total: string;
  consumed: string;
  available: string;
  totalDocuments?: number;
  unit: UnitType;
}

interface IReceivedData {
  total: number;
  consumed: number;
  available: number;
}

export interface IFormattedUsage {
  total: string;
  consumed: string;
  available: string;
}

export interface IUserTable {
  available: string;
  consumed: string;
  id: number;
  size: IReceivedData;
  time: IReceivedData;
  total: string;
  totalDocuments: number;
  unit: string;
  unitType: IFormattedUsage;
  userName: string;
  _id: string;
}

export interface IUserTableRow {
  id: number;
  total: string;
  consumed: string;
  available: string;
  unitType: IFormattedUsage;
  userName: string;
  _id: string;
}

export type SizeUnit = "Bytes" | "KB" | "MB" | "GB";

export interface IUserCreate {
  userName: string;
  unit: string;
  totalSizeBytes?: number;
  totalTime?: number;
  message?: string;
}

export interface IUserInfo {
  _id: string;
  id: number;
  available: string;
  consumed: string;
  total: string;
  userName: string;
  unit?: UnitType;
}

export interface IUserData {
  size: IFormattedUsage;
  time: IFormattedUsage;
  unit: UnitType;
  _id: string;
  userName: string;
}

export interface IUser {
  _id: string;
  userName: string;
  totalSize: number;
  consumedSize: number;
  availableSize: number;
}

export interface IAudioInfo {
  id: string;
  audioUrl: string;
  createdAt: string;
  fileName: string;
}

export interface IDropdown {
  label: string;
  value: string;
  unit: string;
}

export interface IUserState {
  user: IUserInfo[];
  dropdown: IDropdown[];
  audio: IAudioInfo[];
  loading: boolean;
  deleteModel: boolean;
  deleteLoading: boolean;
  audioLoading: boolean;
  userLoading: boolean;
  error: string | null;
  isModelOpen: boolean;
  userInfo: IUserData | null;
  userModel: boolean;
  fileUploadModel: boolean;
  fileModel: boolean;
  fileLoading: boolean;
  userUnitMap: Record<string, UnitType>;
}

export interface IUpdateUserPayload {
  userId: string;
  totalSizeBytes: number;
}

export interface IUploadResponse {
  message: string;
}

export interface ISlotOperation {
  totalBytes: number;
  consumedBytes: number;
  newValueBytes: number;
  operation: "+" | "-";
}

export interface ISelectedUser {
  userName: string | null;
  userId: string | null;
  count: number;
}

export interface IUserDataProps {
  userData: ISelectedUser;
}

export interface IUnitProps {
  unit: SizeUnit;
}

export interface IUserUsage {
  total: number | string;
  consumed: number | string;
  available: number | string;
}

export type UnitType = "size" | "time";

export interface IEditData {
  userId: string;
  unit: string;
  newValue: number;
}

export interface IUserFilePayload {
  userId: string;
  unit: string;
}

export interface IBaseOperation {
  available: number;
  total: number;
  consumed: number;
  incomingValue: number;
  availableError: string;
}

export interface ConvertSizeOptions {
  precision?: number;
  formatted?: boolean;
}
