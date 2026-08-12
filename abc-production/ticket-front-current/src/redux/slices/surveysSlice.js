import { createSlice } from "@reduxjs/toolkit";
import initialState from "../../utils/initialState";
import {
  getSurveyById,
  getSurveys,
  getMoreSurveys,
} from "../actions/surveyActions";

const surveysSlice = createSlice({
  name: "surveys",
  initialState: {
    ...initialState,
    surveyDetails: {
      results: {},
      isLoading: true,
      error: null,
    },
  },
  extraReducers: ({ addCase }) => {
    //handle case getMorePosts
    addCase(getMoreSurveys.fulfilled, (state, action) => {
      const { results, next } = action.payload;
      state.data.results.push(...results);
      state.data.next = next;
    });

    //handle case getPosts
    addCase(getSurveys.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    });
    addCase(getSurveys.rejected, (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    });

    addCase(getSurveyById.pending, (state) => {
      state.surveyDetails.isLoading = true;
      state.surveyDetails.error = null;
      state.surveyDetails.results = {};
    });
    addCase(getSurveyById.fulfilled, (state, action) => {
      state.surveyDetails.isLoading = false;
      state.surveyDetails.results = action.payload;
    });
    addCase(getSurveyById.rejected, (state, action) => {
      state.surveyDetails.isLoading = false;
      state.surveyDetails.error = action.payload;
    });
  },
});

export default surveysSlice.reducer;
