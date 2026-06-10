import {
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";
import dataReducer from "../modules/users/slice";

export const store = configureStore({
  reducer: {
    data: dataReducer,
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
