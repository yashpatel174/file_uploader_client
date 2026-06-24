import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";
import api from "../../utils/intercepter";
import { API_URL } from "../../utils/url";
import type { LoginFormValues } from "./Login";

interface IAuthentication {
  accessToken: string | null;
  refreshToken: string | null;
}

interface IState {
  token: IAuthentication;
}

const initialState: IState = {
  token: { accessToken: null, refreshToken: null },
};

const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<IAuthentication>) => {
      state.token = action.payload;
    },
  },
});

export const handleLogin = createAsyncThunk<
  { result: null; success: boolean },
  LoginFormValues,
  { rejectValue: string }
>("/login", async ({ userName, password }, { rejectWithValue }) => {
  try {
    const res = await api.post(API_URL.LOGIN, { userName, password });
    message.success(res.data.message);
    const { accessToken, refreshToken } = res.data.result;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
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

export const loggingOut = createAsyncThunk<{ result: null; success: boolean }>(
  "/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post(API_URL.LOGOUT);
      message.success(res.data.message);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
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
  },
);

export const { setToken } = AuthSlice.actions;

export default AuthSlice.reducer;
