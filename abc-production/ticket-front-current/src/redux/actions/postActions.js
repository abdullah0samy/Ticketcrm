import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getPosts = createAsyncThunk("post/getPosts", async (params, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    return await axios.get("/ticket/router/note/", { params });
  } catch (error) {
    return rejectWithValue(error);
  }
});

const getMorePosts = createAsyncThunk(
  "post/getMorePosts",
  async (url, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await axios.get(url);
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const createPost = createAsyncThunk(
  "post/createPost",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await axios.post("/ticket/router/note/", payload, {
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

const updatePost = createAsyncThunk(
  "post/updatePost",
  async (payload, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    const { postId, data } = payload;
    try {
      return await axios.patch(`/ticket/router/note/${postId}/`, data, {
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

const deletePostById = createAsyncThunk(
  "post/deletePostById",
  async (postId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await axios.delete(`/ticket/router/note/${postId}/`);
      return postId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export { getPosts, getMorePosts, createPost, updatePost, deletePostById };
