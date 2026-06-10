import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";
import type { AppThunk } from "../../config/store";
import type {
  IAudioInfo,
  IEditData,
  IUploadResponse,
  IUser,
  IUserCreate,
  IUserData,
  IUserInfo,
  IUserState,
  UnitType,
} from "../../interfaces/interface";
import { api } from "../../utils/intercepter";
import { API_URL } from "../../utils/url";

const initialState: IUserState = {
  user: [],
  dropdown: [],
  audio: [],
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
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUserInfo[]>) => {
      state.user = action.payload;
    },
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
      state.userUnitMap[userId] = currentUnit === "size" ? "time" : "size";
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
      .addCase(createUser.rejected, (state, action: PayloadAction<string>) => {
        state.userLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAllUsers.fulfilled,
        (state, action: PayloadAction<IUserInfo[]>) => {
          state.loading = false;
          state.user = action.payload;
          state.dropdown = action.payload?.map((u) => ({
            label: u.userName,
            value: u._id,
            unit: u.unit,
          }));
        },
      )
      .addCase(getAllUsers.rejected, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadFile.pending, (state) => {
        state.fileLoading = true;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.fileLoading = false;
      })
      .addCase(uploadFile.rejected, (state, action: PayloadAction<string>) => {
        state.fileLoading = false;
        state.error = action.payload;
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
      .addCase(getAllFiles.rejected, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (action.payload.success === true) {
          const deletedUserId = action.payload.result;
          state.user = state.user.filter((user) => user._id !== deletedUserId);
          state.dropdown = state.dropdown.filter(
            (user) => user.value !== deletedUserId,
          );
          state.deleteModel = false;
        }
      })
      .addCase(deleteUser.rejected, (state, action: PayloadAction<string>) => {
        state.deleteLoading = false;
        state.error = action.payload;
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
  IUserInfo[],
  void,
  { rejectValue: string }
>("users/list", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get(API_URL.GET_USERS);
    return data.result ?? [];
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
  IUploadResponse,
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

export const {
  setUser,
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
