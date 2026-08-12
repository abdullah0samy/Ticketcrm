import { createAsyncThunk } from "@reduxjs/toolkit";
import { prApi } from "../../api/axios-global";

const getSurveys = createAsyncThunk(
  "surveys/getSurveys",
  async (params, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await prApi.get("/pr/router/survey/", { params });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getMoreSurveys = createAsyncThunk(
  "surveys/getMoreSurveys",
  async (url, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await prApi.get(url);
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getSurveyById = createAsyncThunk(
  "surveys/getSurveyById",
  async (surveyById, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await prApi.get(`/pr/router/survey/${surveyById}/`);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const createSurvey = createAsyncThunk(
  "surveys/createSurvey",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await prApi.post("/pr/router/survey/", payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { getSurveys,getMoreSurveys, createSurvey, getSurveyById };
