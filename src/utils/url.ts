export const API_URL = {
  CREATE_USER: "/user/create", // POST
  GET_USERS: (page: number, limit: number) =>
    `/users?page=${page}&limit=${limit}`, // GET
  UPDATE_FILE_SIZE_LIMIT: (_id: string) => `/users/${_id}`, // PATCH
  FILE_UPLOAD: "/upload", // POST
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
};
