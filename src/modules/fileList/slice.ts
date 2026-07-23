import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  APIPlatform,
  AudioResponse,
  FailReportApi,
  IFileResponse,
  IFileState,
} from "@src/interfaces/interface";
import api from "@src/utils/intercepter";
import { formatBytes } from "@src/utils/sizeConverter";
import { formatDuration } from "@src/utils/timeConverter";
import { API_URL } from "@src/utils/url";
import { message } from "antd";
import axios from "axios";

const initialState: IFileState = {
  file: [],
  reports: [],
  fileLoading: false,
  reportLoading: false,
  error: "",
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  openUserFiles: false,
  apiLoading: false,
};

const FileSlice = createSlice({
  name: "File",
  initialState: initialState as IFileState,
  reducers: {
    setOpenUserFiles: (state, action) => {
      state.openUserFiles = action.payload;
    },
    setApiLoading: (state, action) => {
      state.apiLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllFiles.pending, (state) => {
        state.fileLoading = true;
      })
      .addCase(
        getAllFiles.fulfilled,
        (state, action: PayloadAction<IFileResponse>) => {
          state.fileLoading = false;
          const { data, pagination } = action.payload;
          const { limit, page, total, totalPages } = pagination;
          state.total = total;
          state.page = page;
          state.totalPages = totalPages;
          state.limit = limit;
          state.fileLoading = false;
          state.file = data;
        },
      )
      .addCase(getAllFiles.rejected, (state, action) => {
        state.fileLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      })
      .addCase(errorReportList.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(
        errorReportList.fulfilled,
        (state, action: PayloadAction<any>) => {
          const { jobs } = action.payload;
          state.reportLoading = false;
          state.reports =
            jobs?.map((job: FailReportApi, idx: number) => {
              const dataLimit =
                job.unit === "size"
                  ? formatBytes(job.limit)
                  : formatDuration(job.limit);
              return {
                userName: job.userId.userName,
                platform: job.platform,
                attempt: job.attemptCount,
                error: job.lastError.message,
                jobId: job.jobId,
                limit: dataLimit,
                id: idx + 1,
                retryable: job.retryable,
              };
            }) ?? [];
        },
      )
      .addCase(errorReportList.rejected, (state, action) => {
        state.reportLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong";
      });
  },
});

export const getAllFiles = createAsyncThunk<
  IFileResponse,
  void,
  { rejectValue: string }
>("list/files", async (_, { rejectWithValue }) => {
  try {
    const {
      data: { result },
    } = await api.get(API_URL.GET_FILES);
    return result ?? [];
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

export const getAllAudio = createAsyncThunk<
  AudioResponse,
  { _id: string; platform: APIPlatform },
  { rejectValue: string }
>("audio/list", async ({ _id, platform }, { rejectWithValue }) => {
  try {
    const res = await api.get(API_URL.AUDIO_LIST(_id, platform));
    return res.data;
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

export const errorReportList = createAsyncThunk<
  AudioResponse,
  void,
  { rejectValue: string }
>("error/report", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(API_URL.FAIL_REPORT);
    return res.data.result;
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

export const retryError = createAsyncThunk<
  AudioResponse,
  string,
  { rejectValue: string }
>("error/report", async (jobId, { rejectWithValue }) => {
  try {
    const res = await api.post(API_URL.RETRY_UPLOAD(jobId));
    return res.data;
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

export const { setOpenUserFiles, setApiLoading } = FileSlice.actions;

export default FileSlice.reducer;
