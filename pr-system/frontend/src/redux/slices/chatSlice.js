import { getMessages, getMoreMessages } from "../actions/chatActions";
import initialState from "./../../utils/initialState";
const { createSlice } = require("@reduxjs/toolkit");

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addNewMessage: (state, action) => {
      state.data.results.push(action.payload);
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
  },
});

export const { addNewMessage } = chatSlice.actions;
export default chatSlice.reducer;
