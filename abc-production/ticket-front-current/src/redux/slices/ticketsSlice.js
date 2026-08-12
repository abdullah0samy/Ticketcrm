import { createSlice } from "@reduxjs/toolkit";
import initialState from "../../utils/initialState";
import {
  archiveTickets,
  closeTicket,
  createTicket,
  getTickets,
  transferTickets,
  updateTicket,
} from "../actions/ticketActions";

const ticketsSlice = createSlice({
  name: "tickets",
  initialState: initialState,
  reducers: {
    restTickets: (state) => {
      return initialState;
    },
    addNewTicket: (state, action) => {
      state.data.results.unshift(action.payload);
    },
    removeTicket: (state, action) => {
      const filtertion = state.data.results.filter((post) => {
        return post.id !== action.payload;
      });
      state.data.results = filtertion;
    },
    updateTicket: (state, action) => {
      const findIndex = state.data.results.findIndex(
        (item) => item.id === action.payload.id
      );
      state.data.results[findIndex] = action.payload;
    },
  },
  extraReducers: ({ addCase }) => {
    //handle case getTickets
    addCase(getTickets.fulfilled, (state, action) => {
      state.error = null;
      state.isLoading = false;
      state.data = action.payload;
    });
    addCase(getTickets.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    //handle case updateTicket
    addCase(updateTicket.fulfilled, (state, action) => {
      const findIndex = state.data.results.findIndex(
        (item) => item.id === action.payload.id
      );
      state.data.results[findIndex] = action.payload;
    });

    //handle case close
    addCase(closeTicket.fulfilled, (state, action) => {
      const findIndex = state.data.results.findIndex(
        (item) => item.id === action.payload.id
      );
      state.data.results[findIndex] = action.payload;
    });

    //handle case createTicket
    addCase(createTicket.fulfilled, (state, action) => {
      state.data.results.push(action.payload);
    });

    //handle case archiveTickets
    addCase(archiveTickets.fulfilled, (state, action) => {
      const filterTicket = state.data.results.filter((ticket) => {
        return !action.payload.includes(ticket.id); //|| ticket.status !== "complete"
      });
      state.data.results = filterTicket;
    });

    //handle case transferTickets
    addCase(transferTickets.fulfilled, (state, action) => {
      console.log(action.payload);
      const filterTicket = state.data.results.filter((ticket) => {
        return !action.payload.includes(ticket.id); //|| ticket.status !== "complete"
      });
      state.data.results = filterTicket;
    });
  },
});

export const ticketActions = ticketsSlice.actions;

export default ticketsSlice.reducer;
