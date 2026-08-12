import { createSlice } from "@reduxjs/toolkit";
import initialState from "../../utils/initialState";
import {
  getMoreNotifications,
  getNotifications,
} from "../actions/notificationActions";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNewNotification: (state, action) => {
      state.data.results.unshift(action.payload);
    }
  },
  extraReducers: ({ addCase }) => {
    //handle case getPosts

    addCase(getNotifications.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    });
    addCase(getNotifications.rejected, (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    });
    //handle case getMoreNotifications
    addCase(getMoreNotifications.fulfilled, (state, action) => {
      const { results, next } = action.payload;
      state.data.results.push(...results);
      state.data.next = next;
    });
  },
});

export const { addNewNotification, resetCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
