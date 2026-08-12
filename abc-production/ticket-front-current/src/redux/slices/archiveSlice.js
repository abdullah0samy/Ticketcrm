import { createSlice } from "@reduxjs/toolkit";
import initialState from "../../utils/initialState";

import { getArchives, restoreArchived } from "../actions/archiveActions";

const archiveSlice = createSlice({
  name: "archive",
  initialState: initialState,
  reducers: {
    restArchives: (state) => {
      return initialState;
    },
  },
  extraReducers: ({ addCase }) => {
    //handle case getArchives

    addCase(getArchives.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
    addCase(getArchives.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // handel post restoreArchived
    addCase(restoreArchived.fulfilled, (state, action) => {
    
      const filterTicket = state.data.results.filter(
        (ticket) => !action.payload.includes(ticket.id)
      );
      state.data.results = filterTicket;
    });
  },
});

export const { restArchives } = archiveSlice.actions;
export default archiveSlice.reducer;
