import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getArchives = createAsyncThunk(
  "archive/getArchives",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await axios.get("/ticket/router/restore/", { params });
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const restoreArchived = createAsyncThunk(
  "archive/restoreTickets",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
  
    try {
      await axios.post("/ticket/router/restore/", payload);
      return payload.ticket;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { getArchives, restoreArchived };
