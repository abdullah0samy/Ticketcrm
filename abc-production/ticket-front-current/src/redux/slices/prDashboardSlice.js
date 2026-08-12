import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getPrDashboard = createAsyncThunk(
  "prDashboard/getPrDashboard",
  async (params, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/dashboard/pr/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  data: {},
  isLoading: true,
  error: null,
};

const prDashboardSlice = createSlice({
  name: "prDashboard",
  initialState,
  extraReducers: ({ addCase }) => {
    addCase(getPrDashboard.pending, (state) => {
      return initialState;
    });
    addCase(getPrDashboard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
    addCase(getPrDashboard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export default prDashboardSlice.reducer;
