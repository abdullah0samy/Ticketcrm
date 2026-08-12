import { createSlice } from "@reduxjs/toolkit";
import {
  getTicketById,
  getTicketHistory,
  updateTicket,
} from "../actions/ticketActions";
import initialState from "./../../utils/initialState";

const ticketProfileSlice = createSlice({
  name: "ticketProfile",
  initialState: {
    details: {
      isLoading: true,
      error: null,
      results: {},
    },
    history: initialState,
  },
  extraReducers: ({ addCase }) => {
    //handle case getTickets
    addCase(getTicketById.pending, (state) => {
      state.details.isLoading = true;
      state.details.error = null;
      state.details.results = {};
    });
    addCase(getTicketById.fulfilled, (state, action) => {
      state.details.isLoading = false;
      state.details.results = action.payload;
    });
    addCase(getTicketById.rejected, (state, action) => {
      state.details.isLoading = false;
      state.details.error = action.payload;
    });
    //handle case updateTicket

    addCase(updateTicket.fulfilled, (state, action) => {
      state.details.results = action.payload;
    });

    //handle case getPosts
    addCase(getTicketHistory.pending, (state) => {
      state.history = initialState;
    });
    addCase(getTicketHistory.fulfilled, (state, action) => {
      state.history.data = action.payload;
      state.history.isLoading = false;
    });
    addCase(getTicketHistory.rejected, (state, action) => {
      state.history.error = action.payload;
      state.history.isLoading = false;
    });
  },
});

export default ticketProfileSlice.reducer;
