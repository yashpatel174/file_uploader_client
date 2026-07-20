import {
  configureStore,
  type ThunkAction,
  type UnknownAction,
} from "@reduxjs/toolkit";
import authReducer from "../modules/auth/slice";
import dataReducer from "../modules/users/slice";
import fileReducer from "../modules/fileList/slice";

export const store = configureStore({
  reducer: {
    data: dataReducer,
    auth: authReducer,
    file: fileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;
