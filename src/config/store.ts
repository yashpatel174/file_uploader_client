import {
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";
import dataReducer from "../modules/users/slice";
import authReducer from "../modules/auth/slice";

export const store = configureStore({
  reducer: {
    data: dataReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<any>
>;
