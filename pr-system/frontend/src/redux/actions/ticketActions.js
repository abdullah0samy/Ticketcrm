import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getTickets = createAsyncThunk(
  "tickets/getTickets",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/ticket/router/ticket/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getTicketById = createAsyncThunk(
  "ticketProfile/getTicketById",
  async (payload, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    const { ticketId, params = {} } = payload;
    dispatch(getTicketHistory(ticketId));
    try {
      const res = await axios.get(`/ticket/router/ticket/${ticketId}/`, {
        params,
      });
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getTicketHistory = createAsyncThunk(
  "ticketProfile/getTicketHistory",
  async (ticketId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get(`/ticket/router/history/?id=${ticketId}`);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const createTicket = createAsyncThunk(
  "tickets/createTicket",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.post("/ticket/router/ticket/", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        formSerializer: {
          indexes: true,
        },
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const updateTicket = createAsyncThunk(
  "tickets/updateTicket",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    const { ticketId, data } = payload;
    try {
      return await axios.patch(`/ticket/router/ticket/${ticketId}/`, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const archiveTickets = createAsyncThunk(
  "tickets/archiveTickets",
  async (payload = [], thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await axios.delete("/ticket/router/ticket/", {
        data: payload,
      });
      return payload.ticket;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const closeTicket = createAsyncThunk(
  "tickets/closeTicket",
  async (tickedId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.patch(`/ticket/router/ticket/${tickedId}/close/`);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const transferTickets = createAsyncThunk(
  "tickets/transferTicket",
  async (payload = [], thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await axios.post("/ticket/router/ticket/transfer/", payload);
      return payload.ticket;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export {
  getTickets,
  createTicket,
  getTicketById,
  getTicketHistory,
  archiveTickets,
  updateTicket,
  transferTickets,
  closeTicket,
};
