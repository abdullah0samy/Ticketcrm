import { createSlice } from "@reduxjs/toolkit";
import initialState from "./../../utils/initialState";
import { getExports, getMoreExports } from "../actions/exportActions";

const exportsSlice = createSlice({
  name: "exports",
  initialState: {
    ...initialState,
    exportStatus: 0,
  },
  reducers: {
    addNewExport: (state, action) => {
      state.data.results.unshift(action.payload);
    },
    updateExportStatus: (state, action) => {
      state.exportStatus = action.payload;
    },
    restExports: (state) => {
      state.data = initialState.data;
      state.error = initialState.error;
      state.isLoading = initialState.isLoading;
      state.exportStatus = 0;
    },
  },

  extraReducers: ({ addCase }) => {
    //handle case getExports
    addCase(getExports.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    });
    addCase(getExports.rejected, (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    });

    //handle case getMoreExports
    addCase(getMoreExports.fulfilled, (state, action) => {
      const { results, next } = action.payload;
      state.data.results.push(...results);
      state.data.next = next;
    });
  },
});

export const exportActions = exportsSlice.actions;
export default exportsSlice.reducer;
