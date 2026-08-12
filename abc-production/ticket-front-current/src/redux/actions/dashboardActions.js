import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * Consolidated landing-dashboard payload: counters, SLA health, priority mix,
 * agent workload, department load, recent activity and a daily trend.
 */
const getDashboardSummary = createAsyncThunk(
  "dashboard/getSummary",
  async (params, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/dashboard/summary/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { getDashboardSummary };
