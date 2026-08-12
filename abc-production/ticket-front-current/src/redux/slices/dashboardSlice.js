import { createSlice } from "@reduxjs/toolkit";
import { getDashboardSummary } from "../actions/dashboardActions";

const initialState = {
  data: {
    stats: {},
    priority_distribution: [],
    status_distribution: [],
    agent_performance: [],
    department_load: [],
    recent_activity: [],
    trend: [],
  },
  isLoading: true,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  extraReducers: ({ addCase }) => {
    addCase(getDashboardSummary.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    addCase(getDashboardSummary.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    });
    addCase(getDashboardSummary.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export default dashboardSlice.reducer;
