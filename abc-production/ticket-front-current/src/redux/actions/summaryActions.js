import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getSummary = createAsyncThunk(
  "summary/getSummary",
  async (params, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/dashboard/ticket/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
const getTicketStatistic = createAsyncThunk(
  "summary/getTicketStatistic",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/dashboard/ticket_statistic_table/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { getSummary, getTicketStatistic };
