import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getExports = createAsyncThunk(
  "exports/getExports",
  async (params, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/ticket/router/exports/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getMoreExports = createAsyncThunk(
  "exports/getMoreExports",
  async (url, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await axios.get(url);
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const exportTickets = createAsyncThunk(
  "exports/exportTickets",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    const { filename, created_at, chunk } = payload;
    try {
      await axios.get("/ticket/export/", {
        params: {
          filename,
          chunk,
          created_at,
        },
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { getExports, getMoreExports, exportTickets };
