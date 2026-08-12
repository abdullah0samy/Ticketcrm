import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { instanceLogin } from "../../api/axios-global";

const login = createAsyncThunk("account/login", async (payload, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const { data } = await instanceLogin.post("/users/login/", payload);

    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const getProfile = createAsyncThunk(
  "account/getProfile",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.get("/users/profile/");
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const updateAccount = createAsyncThunk(
  "account/updateAccount",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.patch("/users/profile/", payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const changePassword = createAsyncThunk(
  "account/changePassword",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.patch("/users/change-password/", payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { login, getProfile, updateAccount, changePassword };
