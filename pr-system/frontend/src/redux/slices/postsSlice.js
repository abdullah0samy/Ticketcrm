import { createSlice } from "@reduxjs/toolkit";
import initialState from "./../../utils/initialState";
import {
  createPost,
  deletePostById,
  getMorePosts,
  getPosts,
  updatePost,
} from "../actions/postActions";

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    restPosts: (state) => {
      return initialState;
    },
    addNewPost: (state, action) => {
      state.data.results.unshift(action.payload);
    },
    removePost: (state, action) => {
      const filtertion = state.data.results.filter((post) => {
        return post.id !== action.payload;
      });
      state.data.results = filtertion;
    },
    updatePost: (state, action) => {
      const findIndex = state.data.results.findIndex(
        (item) => item.id === action.payload.id
      );
      state.data.results[findIndex] = action.payload;
    },
  },
  extraReducers: ({ addCase }) => {
    //handle case getPosts
    addCase(getPosts.pending, (state) => {
      return initialState;
    });
    addCase(getPosts.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    });
    addCase(getPosts.rejected, (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    });

    //handle case getMorePosts
    addCase(getMorePosts.fulfilled, (state, action) => {
      const { results, next } = action.payload;
      state.data.results.push(...results);
      state.data.next = next;
    });

    //handle case createPost
    addCase(createPost.fulfilled, (state, action) => {
      state.data.results.unshift(action.payload);
    });

    //handle case deletePostById
    addCase(deletePostById.fulfilled, (state, action) => {
      const filtertion = state.data.results.filter((post) => {
        return post.id !== action.payload;
      });
      state.data.results = filtertion;
    });

    //handle case updatePost
    addCase(updatePost.fulfilled, (state, action) => {
      const findIndex = state.data.results.findIndex(
        (item) => item.id === action.payload.id
      );
      state.data.results[findIndex] = action.payload;
    });
  },
});

export const postActions = postsSlice.actions;
export default postsSlice.reducer;
