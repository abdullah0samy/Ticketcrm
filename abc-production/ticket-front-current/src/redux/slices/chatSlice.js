import {
  getMessages,
  getMoreMessages,
  createTicketMessage,
  updateTicketMessage,
  deleteTicketMessage,
} from "../actions/chatActions";
import initialState from "./../../utils/initialState";
const { createSlice } = require("@reduxjs/toolkit");

/**
 * Append a message unless it is already in the list.
 *
 * The sender gets its own message twice — once from the POST response and once
 * echoed back over the websocket — which used to render it twice until the
 * modal was reopened.
 */
const appendUnique = (state, message) => {
  if (!message || message.id == null) return;
  if (state.data.results.some((m) => m.id === message.id)) return;
  state.data.results.push(message);
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addNewMessage: (state, action) => {
      appendUnique(state, action.payload);
    },
  },
  extraReducers: ({ addCase }) => {
    //handle case getMessages
    addCase(getMessages.pending, (state) => {
      return initialState;
    });
    addCase(getMessages.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    });
    addCase(getMessages.rejected, (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    });

    //handle case getMoreMessages
    addCase(getMoreMessages.fulfilled, (state, action) => {
      const { results, next } = action.payload;
      state.data.results.unshift(...results);
      state.data.next = next;
    });

    // The websocket echo may lose a race with the HTTP response on a fast
    // local network, so the sender's own message is added here too.
    addCase(createTicketMessage.fulfilled, (state, action) => {
      appendUnique(state, action.payload);
    });

    addCase(updateTicketMessage.fulfilled, (state, action) => {
      const index = state.data.results.findIndex(
        (m) => m.id === action.payload?.id
      );
      if (index !== -1) state.data.results[index] = action.payload;
    });

    addCase(deleteTicketMessage.fulfilled, (state, action) => {
      state.data.results = state.data.results.filter(
        (m) => m.id !== action.payload
      );
    });
  },
});

export const { addNewMessage } = chatSlice.actions;
export default chatSlice.reducer;
