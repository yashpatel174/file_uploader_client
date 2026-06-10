export const API_URL = {
  CREATE_USER: "/user/create", // POST
  GET_USERS: "/users", // GET
  UPDATE_FILE_SIZE_LIMIT: (_id: string) => `/users/${_id}`, // PATCH
  FILE_UPLOAD: "/upload", // POST
  DELETE_USER: (id: string) => `/${id}`, // DELETE
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
