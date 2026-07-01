export type UnitType = "size" | "time";

export interface IUnitUsage {
  total: number;
  consumed: number;
}

export interface IUsage<T = number> {
  total: T;
  consumed: T;
  available: T;
}

export type IUnitInt = IUsage<number>;
export type IFormattedUsage = IUsage<string>;

export interface IUserBase {
  _id: string;
  userName: string;
}

export interface LoginFormValues {
  userName: string;
  password: string;
}

export interface IUserQuota<T = number | string> {
  size: IUsage<T>;
  time: IUsage<T>;
}

export interface IUserInfo extends IUserBase, IUserQuota<number> {
  unit: UnitType;
  totalDocuments: number;
  googleAuth: boolean;
  dropboxAuth: boolean;
}

export interface IUserTable {
  available: string;
  consumed: string;
  id: number;
  size: IUnitInt;
  time: IUnitInt;
  total: string;
  totalDocuments: number;
  unit: string;
  unitType: IFormattedUsage;
  userName: string;
  _id: string;
}

export type SizeUnit = "Bytes" | "KB" | "MB" | "GB";

export interface IUserUsage {
  total: number | string;
  consumed: number | string;
  available: number | string;
}
export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserData extends IUserBase {
  unit: string;
  size: IUsage<number>;
  time: IUsage<number>;
}

export interface IUserTableBase extends IUserBase {
  id: number;
  total: string;
  consumed: string;
  available: string;
}

export interface IUserTableRow extends IUserTableBase {
  unitType: IFormattedUsage;
}

export interface IUserTable extends IUserTableBase {
  size: IUnitInt;
  time: IUnitInt;
  unit: string;
  totalDocuments: number;
  unitType: IFormattedUsage;
}

export interface IUserTableHeader extends IUserTableBase {
  action?: string;
  unit: UnitType;
  totalDocuments?: number;
}

export interface IAuthProviders {
  googleAuth: boolean;
  dropboxAuth: boolean;
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
export interface IDropdown extends IAuthProviders {
  label: string;
  value: string;
  unit: UnitType;
  size: IUnitUsage;
  time: IUnitUsage;
  disabled: boolean;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}

export interface IUserDropdown extends IUserBase {
  unit: UnitType;
  googleAuthenticated: boolean;
  dropboxAuthenticated: boolean;
  size: IUnitUsage;
  time: IUnitUsage;
}

export interface IUserResponse {
  transformedUsers: IUserInfo[];
  pagination: IPagination;
  dropdown: IUserDropdown[];
}

export interface IUserState {
  user: IUserInfo[];
  dropdown: IDropdown[];
  audio: IAudioInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  deleteLoading: boolean;
  audioLoading: boolean;
  userLoading: boolean;
  fileLoading: boolean;
  deleteModel: boolean;
  isModelOpen: boolean;
  userModel: boolean;
  fileUploadModel: boolean;
  fileModel: boolean;
  error: string | null;
  userInfo: IUserData | null;
  userUnitMap: Record<string, UnitType>;
}

export interface IUpdateUserPayload {
  userId: string;
  totalSizeBytes: number;
}

export interface IApiMessage {
  message: string;
}

export type IUserCreate = IApiMessage & {
  userName: string;
  unit: UnitType;
  totalSizeBytes?: number;
  totalTime?: number;
  totalSize?: number;
  sizeUnit?: string;
  email: string;
};

export interface IUserSelection {
  userId: string | null;
  userName: string | null;
}

export interface ISelectedUser extends IUserSelection {
  count: number;
}

export interface ISlotOperation {
  totalBytes: number;
  consumedBytes: number;
  newValueBytes: number;
  operation: "+" | "-";
}

export interface IUserDataProps {
  userData: ISelectedUser;
}

export interface IUnitProps {
  unit: SizeUnit;
}

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

export interface EditFormValues {
  unit: string;
  totalSizeBytes?: number;
  totalTime?: number;
}
