import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";
import type { AppThunk } from "../../config/store";
import type {
  IApiMessage,
  IAudioInfo,
  IEditData,
  IUser,
  IUserCreate,
  IUserData,
  IUserResponse,
  IUserState,
  UnitType,
} from "../../interfaces/interface";
import api from "../../utils/intercepter";
import { API_URL } from "../../utils/url";

const initialState: IUserState = {
  user: [],
  dropdown: [],
  audio: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
  deleteModel: false,
  deleteLoading: false,
  audioLoading: false,
  userLoading: false,
  error: null,
  isModelOpen: false,
  userInfo: null,
  userModel: false,
  fileUploadModel: false,
  fileModel: false,
  fileLoading: false,
  userUnitMap: {},
};

const UserSlice = createSlice({
  name: "User",
  initialState: initialState as IUserState,
  reducers: {
    setOpenModel: (state) => {
      state.isModelOpen = true;
    },
    setCloseModel: (state) => {
      state.isModelOpen = false;
    },
    setUserInfo: (state, action: PayloadAction<IUserData>) => {
      state.userInfo = action.payload;
    },
    setOpenUserModel: (state) => {
      state.userModel = true;
    },
    setCloseUserModel: (state) => {
      state.userModel = false;
    },
    setOpenUpload: (state) => {
      state.fileUploadModel = true;
    },
    setCloseUpload: (state) => {
      state.fileUploadModel = false;
    },
    setOpenUserData: (state) => {
      state.fileModel = true;
    },
    setCloseUserData: (state) => {
      state.fileModel = false;
    },
    setDeleteModel: (state, action) => {
      state.deleteModel = action.payload;
    },
    setUserUnitMap: (
      state,
      action: PayloadAction<{ userId: string; defaultUnit: UnitType }>,
    ) => {
      const { userId, defaultUnit = "size" } = action.payload;
      const currentUnit = state.userUnitMap[userId] ?? defaultUnit;
      const newUnit = currentUnit === "size" ? "time" : "size";
      state.userUnitMap[userId] = newUnit;
      state.dropdown = state.dropdown.map((item) =>
        item.value === userId
          ? {
              ...item,
              unit: newUnit,
              disabled: item[newUnit].total === item[newUnit].consumed,
            }
          : item,
      );
    },
    setAudioLoading: (state, action) => {
      state.audioLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.userLoading = true;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.userLoading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.userLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAllUsers.fulfilled,
        (state, action: PayloadAction<IUserResponse>) => {
          state.loading = false;
          const { pagination, transformedUsers, dropdown } = action.payload;
          const { limit, page, total, totalPages } = pagination;
          state.total = total;
          state.page = page;
          state.totalPages = totalPages;
          state.limit = limit;
          state.user = transformedUsers;
          state.dropdown = dropdown?.map((u) => {
            const selectedUnit = state.userUnitMap[u._id] ?? u.unit;
            return {
              label: u.userName,
              value: u._id,
              unit: selectedUnit,
              size: u.size,
              time: u.time,
              googleAuth: u.googleAuthenticated,
              dropboxAuth: u.dropboxAuthenticated,
              disabled: u[selectedUnit].total === u[selectedUnit].consumed,
            };
          });
        },
      )
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.user = [];
        state.dropdown = [];
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      })
      .addCase(uploadFile.pending, (state) => {
        state.fileLoading = true;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.fileLoading = false;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.fileLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      })
      .addCase(getAllFiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAllFiles.fulfilled,
        (state, action: PayloadAction<IAudioInfo[]>) => {
          state.loading = false;
          state.audio = action.payload;
        },
      )
      .addCase(getAllFiles.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      })
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (action.payload.success === true) {
          const deletedUserId = action.payload.result;
          state.dropdown = state.dropdown.filter(
            (user) => user.value !== deletedUserId,
          );
          state.deleteModel = false;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
        state.user = [];
      });
  },
});

export const createUser = createAsyncThunk<
  IUserCreate,
  IUserCreate,
  { rejectValue: string }
>("/create", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post(API_URL.CREATE_USER, {
      userName: payload.userName,
      unit: payload.unit,
      totalSizeBytes: Number(payload.totalSizeBytes) || 0,
      totalTime: Number(payload.totalTime) || 600,
      email: payload.email,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      message.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message || "Backend error");
    }
  }
});

export const getAllUsers = createAsyncThunk<
  IUserResponse,
  { page: number; limit: number },
  { rejectValue: string }
>("users/list", async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    const {
      data: { result },
    } = await api.get(API_URL.GET_USERS(page, limit));
    return result ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      message.error(error.response?.data?.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
    return rejectWithValue("Something went wrong");
  }
});

export const updateUserInfo = createAsyncThunk<
  IUser,
  IEditData,
  { rejectValue: string }
>("/update", async ({ userId, unit, newValue }) => {
  try {
    if (!userId) message.error("User ID is required");
    const res = await api.patch(API_URL.UPDATE_FILE_SIZE_LIMIT(userId), {
      unit,
      newValue,
    });
    message.success(res.data.message);
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return message.error(error.response?.data?.message);
    }
  }
});

export const uploadFile = createAsyncThunk<
  IApiMessage,
  FormData,
  { rejectValue: string }
>("/file/upload", async (payload) => {
  try {
    const res = await api.post(API_URL.FILE_UPLOAD, payload);
    message.success(res.data.message);
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return message.error(error.response?.data?.message);
    }
  }
});

export const getAllFiles = createAsyncThunk<
  IAudioInfo[],
  string,
  { rejectValue: string }
>("/audio", async (_id: string, { rejectWithValue }) => {
  try {
    const res = await api.get(API_URL.AUDIO(_id));
    return res.data.result;
  } catch (error) {
    let errorMessage = "";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    message.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const googleConnected =
  (data: any): AppThunk<any> =>
  async () => {
    try {
      const response = await api.post(API_URL.GOOGLE.GOOGLE_CONNECT, data);
      return Promise.resolve(response.data);
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  };

export const getAudioPlayed = createAsyncThunk<
  IAudioInfo[],
  string,
  { rejectValue: string }
>("/play/audio", async (_id: string, { rejectWithValue }) => {
  try {
    const res = await api.get(API_URL.PLAY_AUDIO.PLAY(_id));
    return res.data;
  } catch (error) {
    let errorMessage = "";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    message.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const deleteUser = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("/delete", async (_id: string, { rejectWithValue }) => {
  try {
    const res = await api.delete(API_URL.DELETE_USER(_id));
    message.success(res.data.message);
    return res.data;
  } catch (error) {
    let errorMessage = "";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    message.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const authConnection = createAsyncThunk<
  { result: string },
  { platform: string; _id: string },
  { rejectValue: string }
>("/auth", async ({ platform, _id }, { rejectWithValue }) => {
  try {
    const res = await api.get(API_URL.AUTH_CONNECTION(platform, _id));
    message.success(res.data.message);
    return res.data.result;
  } catch (error) {
    let errorMessage = "";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    message.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const {
  setUserInfo,
  setOpenModel,
  setCloseModel,
  setOpenUpload,
  setCloseUpload,
  setUserUnitMap,
  setDeleteModel,
  setAudioLoading,
  setOpenUserData,
  setCloseUserData,
  setOpenUserModel,
  setCloseUserModel,
} = UserSlice.actions;

export default UserSlice.reducer;
