import type { IUserData, UnitType } from "../interfaces/interface";

export const menuItems = [
  {
    key: "/users",
    label: "Users",
  },
  {
    key: "/file-upload",
    label: "File Upload",
  },
];

export const fileUploadPlatform = [
  { label: "SFTP", value: "sftp" },
  { label: "FTP", value: "ftp" },
  { label: "Dropbox", value: "dropbox" },
  { label: "Google Drive", value: "drive" },
];

export const getUsagePercentage = (user: IUserData, unit = "size") => {
  const data = user?.[unit as UnitType];
  const { total, consumed } = data ?? {
    total: 0,
    consumed: 0,
  };
  if (!total) return 0;
  return Math.round((Number(consumed) / Number(total)) * 100);
};

export const getStorageStatus = (percentage: number) => {
  if (percentage >= 100) {
    return {
      status: "Block Upload",
      color: "#ff4d4f",
    };
  }

  if (percentage >= 90) {
    return {
      status: "Critical",
      color: "#fa541c",
    };
  }

  if (percentage >= 80) {
    return {
      status: "Warning",
      color: "#faad14",
    };
  }

  return {
    status: "Healthy",
    color: "#52c41a",
  };
};
