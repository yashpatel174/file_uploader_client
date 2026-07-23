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
  failReports?: IFailReport[];
}

export interface IFailReport {
  userId: string;
  unit: UnitType;
  actualLimit: number;
  jobId: string;
}

export interface IUserState {
  user: IUserInfo[];
  dropdown: IDropdown[];
  audio: IAudioInfo[];
  refreshKey: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  audioLoading: boolean;
  userLoading: boolean;
  fileLoading: boolean;
  deleteModel: boolean;
  isModelOpen: boolean;
  userModel: boolean;
  fileUploadModel: boolean;
  fileModel: boolean;
  failReport?: IFailReport[];
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

export interface IUpdatedSize {
  userId: string;
  unit: string;
  newValue: number;
  newAvailableValue: number;
}

export interface IEditData extends IUpdatedSize {
  isReset: boolean;
  isMail: boolean;
  jobId: string | null;
  emailPayload: IEmailPayload;
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
  newSize: number;
  newTime: number;
  totalTime?: number;
  opearation: "+" | "-";
  consumed: string;
}

export type APIPlatform = "sftp" | "ftp" | "dropbox" | "drive";

export interface FileList {
  userId: string;
  userName: string;
  platform: APIPlatform;
}

export interface IFileTable extends FileList {
  id: number;
}

export interface IFailReportColumn extends IFileTable {
  attempt: number;
}

export interface FailReportResponse extends IFailReportColumn {
  retryId: string;
  disable: boolean;
  lastError: string;
  error: string;
  jobId: string;
  retryable: boolean;
}

export interface FailReportApi {
  userId: {
    userName: string;
  };
  platform: APIPlatform;
  attemptCount: number;
  retryable: boolean;
  jobId: string;
  limit: number;
  unit: UnitType;
  lastError: {
    code: string;
    message: string;
    provider: string;
    failureType: string;
  };
}

export interface FailReportTable {
  id: number;
  userName: string;
  platform: APIPlatform;
  attempt: number;
  retryable: boolean;
  jobId: string;
  limit: string;
  lastError: string;
  error: string;
}

export interface IFileState {
  file: FileList[];
  fileLoading: boolean;
  error: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  openUserFiles: boolean;
  reportLoading: boolean;
  reports: FailReportTable[];
  apiLoading: boolean;
}
export interface ISelectedFile {
  userId: string | null;
  platform: APIPlatform | null;
}

export interface IFileResponse {
  data: FileList[];
  pagination: IPagination;
}

export interface AudioResult {
  id: string;
  audioUrl: string;
  fileName: string;
  success: boolean;
  lastError?: string;
}

export interface AudioResponse {
  success: boolean;
  message: string;
  result: AudioResult[];
}
export interface IEmailPayload {
  unit: string;
  total: string;
  used: string;
  updated: string;
}
