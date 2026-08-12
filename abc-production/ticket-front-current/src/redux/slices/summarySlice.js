import { createSlice } from "@reduxjs/toolkit";
import { getSummary, getTicketStatistic } from "../actions/summaryActions";

const initialState = {
  data: {
    tickets: {
      on_hold: 0,
      in_progress: 0,
      complete: 0,
      closed: 0,
    },
    aht: 0,
    most_issuetypes: [],
    most_departments: [],
  },
  isLoading: true,
  error: null,
  ticket_statistic: {
    isLoading: true,
    error: null,
    data: {
      count: 0,
      next: null,
      previous: null,
      results: [],
    },
  },
};

const summarySlice = createSlice({
  name: "summary",
  initialState,
  extraReducers: ({ addCase }) => {
    // handle get summary
    addCase(getSummary.pending, (state) => {
      return initialState;
    });
    addCase(getSummary.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
    addCase(getSummary.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // handle get ticket statistic
    addCase(getTicketStatistic.fulfilled, (state, action) => {
      state.ticket_statistic.isLoading = false;
      state.ticket_statistic.data = action.payload;
    });
    addCase(getTicketStatistic.rejected, (state, action) => {
      state.ticket_statistic.isLoading = false;
      state.ticket_statistic.error = action.payload;
    });
  },
});

export default summarySlice.reducer;
