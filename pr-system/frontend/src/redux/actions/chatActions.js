import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (params, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/ticket/router/comment/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getMoreMessages = createAsyncThunk(
  "chat/getMoreMessages",
  async (url, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get(url);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const createTicketMessage = createAsyncThunk(
  "chat/AddTicketMessage",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.post("/ticket/router/comment/", payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
export { getMessages, getMoreMessages ,createTicketMessage};
