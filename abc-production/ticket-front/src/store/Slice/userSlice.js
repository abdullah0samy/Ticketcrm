import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchApi, baseUrl, patchApi } from "../../utils/crudApi";


export const getUser = createAsyncThunk("user/getUser", async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await fetchApi("profile/");
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const login = createAsyncThunk("user/login", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await axios.post(`${baseUrl}/login/`, data);
        localStorage.setItem("Token", res.data.token)
        return res.data
    } catch (error) {
        if (error.response) {
            return rejectWithValue(error.response.data.message);
        } else {
            return rejectWithValue(error.message)
        }
    }
});


export const updateUser = createAsyncThunk("user/updateUser", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await patchApi("profile/", data);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }

});
export const changePassword = createAsyncThunk("user/changePassword", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await patchApi("change-password/", data);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }

});



const initialState = {
    userData: null,
    isUser: null,
    userLoad: true
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        logOut: (state) => {
            localStorage.removeItem("Token")
            state.userData = null
            state.isUser = null
            state.userLoad = null
        }
    },
    extraReducers: {
        [login.fulfilled]: (state, action) => {
            state.userData = action.payload
            state.isUser = true
        },

        [getUser.fulfilled]: (state, action) => {
            state.userData = action.payload
            state.isUser = true
            state.userLoad = null
        },
        [getUser.rejected]: (state, action) => {
            state.userData = null
            state.isUser = false
            state.userLoad = null
        },

        [updateUser.fulfilled]: (state, action) => {
            state.userData = action.payload
        },
    }

})
export const { logOut } = userSlice.actions
export default userSlice.reducer