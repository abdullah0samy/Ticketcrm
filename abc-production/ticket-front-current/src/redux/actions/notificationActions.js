import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { reset_notifications_count } from "../slices/accountSlice";

const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (params, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    try {
      const res = await axios.get("/users/router/notification/", { params });
      dispatch(reset_notifications_count());
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getMoreNotifications = createAsyncThunk(
  "notifications/getMoreNotifications",
  async (url, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get(url);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { getNotifications, getMoreNotifications };
