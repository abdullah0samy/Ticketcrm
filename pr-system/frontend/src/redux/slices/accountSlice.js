import { createSlice } from "@reduxjs/toolkit";
import { getProfile, updateAccount } from "../actions/accountActions";

const accountSlice = createSlice({
  name: "account",
  initialState: {
    isLoading: true,
    isLogged: null,
    userData: {},
  },
  reducers: {
    logOut: (state) => {
      state.isLogged = false;
      state.userData = {};
      localStorage.clear("Token");
    },
    reset_notifications_count: (state) => {
      state.userData.notifications_count = 0;
    },
  },
  extraReducers: ({ addCase }) => {
    //handle case login
    addCase(getProfile.pending, (state, action) => {
      state.isLogged = false;
      state.isLoading = true;
      state.userData = {};
    });
    //handle case getProfile
    addCase(getProfile.fulfilled, (state, action) => {
      state.isLogged = true;
      state.isLoading = false;
      state.userData = action.payload;
    });
    addCase(getProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isLogged = false;
    });
    addCase(updateAccount.fulfilled, (state, action) => {
      state.userData = action.payload;
    });
  },
});

export const { logOut, reset_notifications_count } = accountSlice.actions;
export default accountSlice.reducer;
