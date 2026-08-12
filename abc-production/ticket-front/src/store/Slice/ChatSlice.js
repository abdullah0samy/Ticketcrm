import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchApi, postApi } from "../../utils/crudApi";

export const getMessages = createAsyncThunk("chat/getMessages", async (ticketId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await fetchApi(`router/comment-ticket/?id=${ticketId}`);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const AddTicketMessage = createAsyncThunk("chat/AddTicketMessage", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await postApi("router/comment-ticket/", data);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getNextMessages = createAsyncThunk("chat/getNextMessages", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const { ticketId, pageNum } = data
        const res = await fetchApi(`router/comment-ticket/?id=${ticketId}&page=${pageNum}`);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

const initialState = {
    count: null,
    next: null,
    previous: null,
    messagesList: [],
    ticketId: null,
    loading: true,
    error: null,
    showChat: false
}
const ChatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        restChat: (state, action) => {
            state = initialState
        },
        openChat: (state, action) => {
            state.showChat = true
            state.ticketId = action.payload
            state.loading = true

        },
        closeChat: (state, action) => {
            state.showChat = false
            // state.messagesList = []
            state.ticketId = null
            state.next = null
        },
        addNewMessage: (state, action) => {
            state.messagesList.push(action.payload)
        }
    },

    extraReducers: {
        [getMessages.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.messagesList = results
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null

        },
        [getMessages.rejected]: (state, action) => {
            state.error = action.payload
            state.loading = null
            state.messagesList = []
            state.next = null
            state.previous = null
        },

        [getNextMessages.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.messagesList.unshift(...results)
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null
        },

    }
})

export const { restChat, openChat, closeChat, addNewMessage } = ChatSlice.actions
export default ChatSlice.reducer