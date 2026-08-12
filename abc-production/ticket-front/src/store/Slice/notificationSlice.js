import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchApi, fetchApiUrl, postApi } from "../../utils/crudApi";

export const getNotification = createAsyncThunk("notification/getNotification", async (quarys, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await fetchApi("router/notification/");
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const addNotification = createAsyncThunk("notification/addNotification", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await postApi("router/note/", data);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const restCount = createAsyncThunk("notification/addNotification", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await postApi("router/notification/", {});
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});


export const getNextNotification = createAsyncThunk("notification/getNextNotification", async (next, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await fetchApiUrl(next);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});


const initialState = {
    count: null,
    next: null,
    previous: null,
    notificationList: [],
    loading: true,
    error: null,
    count_new: 0
}
const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        restNotification: (state, action) => {
            state.notificationList = []
            state.loading = true
            state.error = null
            state.count_new = 0
        },
        addNewNotification: (state, action) => {
            state.count_new = state.count_new + 1
            state.notificationList.unshift(action.payload)
        }
    },
    extraReducers: {
        // handel get note
        [getNotification.fulfilled]: (state, action) => {
            const { results, count, next, previous, count_new } = action.payload
            state.notificationList = results
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null
            state.count_new = count_new

        },
        [getNotification.rejected]: (state, action) => {
            state.error = action.payload
            state.loading = null
            state.notificationList = []
            state.next = null
            state.previous = null
            state.count_new = 0
        },


        // handel more note
        [getNextNotification.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.notificationList.push(...results)
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null
        },
        [restCount.fulfilled]: (state, action) => {
            state.count_new = 0
        },
        [restCount.rejected]: (state, action) => {
            state.count_new = 0
        },

    }
})

export const { restNotification, addNewNotification } = notificationSlice.actions
export default notificationSlice.reducer