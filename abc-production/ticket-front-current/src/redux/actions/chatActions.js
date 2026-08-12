import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (params, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/ticket/router/comment/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getMoreMessages = createAsyncThunk(
  "chat/getMoreMessages",
  async (url, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get(url);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Send a message.
 *
 * Messages can now carry a photo, a voice note or a file, so the payload may
 * be a plain object (text only) or already-built FormData. Axios sets the
 * multipart boundary itself when handed FormData — setting Content-Type by
 * hand strips it and the upload arrives unparseable.
 */
const createTicketMessage = createAsyncThunk(
  "chat/AddTicketMessage",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const isMultipart = typeof FormData !== "undefined" && payload instanceof FormData;
      return await axios.post("/ticket/router/comment/", payload, {
        // Uploads over a hospital VPN are slow; the default timeout aborts a
        // voice note halfway through.
        timeout: isMultipart ? 120000 : 30000,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/** Edit the text of a message you sent. The attachment is immutable. */
const updateTicketMessage = createAsyncThunk(
  "chat/updateTicketMessage",
  async ({ id, comment }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.patch(`/ticket/router/comment/${id}/`, { comment });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const deleteTicketMessage = createAsyncThunk(
  "chat/deleteTicketMessage",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await axios.delete(`/ticket/router/comment/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export {
  getMessages,
  getMoreMessages,
  createTicketMessage,
  updateTicketMessage,
  deleteTicketMessage,
};
