export const API_URL = {
  LOGIN: "/admin/login", // POST
  LOGOUT: "/admin/logout", // POST
  REFRESH_TOKEN: "/auth/refresh", // POST
  CREATE_USER: "/user/create", // POST
  GET_USERS: (page: number, limit: number) =>
    `/users?page=${page}&limit=${limit}`, // GET
  UPDATE_FILE_SIZE_LIMIT: (_id: string) => `/users/${_id}`, // PATCH
  FILE_UPLOAD: "/upload", // POST
  MULTIPLE_FILE_UPLOAD: (_id: string) => `/upload/${_id}/multiple-files`, // POST
  DELETE_USER: (id: string) => `/${id}`, // DELETE
  AUTH_CONNECTION: (platform: string, _id: string) =>
    `/auth/${platform}/connection/${_id}`, // GET
  AUDIO: (_id: string) => `/audio/${_id}`, // GET
  GOOGLE: {
    GOOGLE_CONNECT: "/api/google/callback", // POST
  },
  DROPBOX: {
    DROPBOX_CONNECT: "/api/dropbox/token", // POST
  },
  PLAY_AUDIO: {
    PLAY: (id: string) => `/api/files/${id}/stream`, // GET
  },
  FAIL_REPORT: (page: number, limit: number) =>
    `/upload/failed?page=${page}&limit=${limit}`, // GET
  RETRY_UPLOAD: (jobId: string) => `/upload/${jobId}/retry`, // POST,
  GET_FILES: (page: number, limit: number) =>
    `/upload/files?page=${page}&limit=${limit}`, // GET
  AUDIO_LIST: (_id: string, platform: string) =>
    `/user/audio/${_id}/${platform}`,
};
