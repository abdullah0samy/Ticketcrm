import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteApi, fetchApi, patchApi, postApi } from "../../utils/crudApi";


export const getTickets = createAsyncThunk("tickets/getTickets", async (quarys, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
        quarys.me = false
        const res = await fetchApi("router/ticket/", quarys);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getMyTickets = createAsyncThunk("tickets/getMyTickets", async (quarys, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        quarys.me = true
        const res = await fetchApi("router/ticket/", quarys);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const createTicket = createAsyncThunk("tickets/AddTicket", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await postApi("router/ticket/", data);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const transferTicket = createAsyncThunk("tickets/transferTicket", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        await postApi("transfer/", data);
        return data.ticket
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const ArchiveTicket = createAsyncThunk("tickets/ArchiveTicket", async (ticketId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        await deleteApi(`router/ticket/${ticketId}/`);
        return ticketId

    } catch (error) {
        return rejectWithValue(error);
    }
});

export const multipleArchiveTicket = createAsyncThunk("tickets/multipleArchiveTicket", async (ticketId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        await deleteApi(`router/ticket/`, { ticket: ticketId });
        return ticketId

    } catch (error) {
        return rejectWithValue(error);
    }
});

export const patchTicket = createAsyncThunk("tickets/EditeTicketIssuetype", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await patchApi(`router/ticket/${data.ticketId}/`, data);
        return res

    } catch (error) {
        return rejectWithValue(error);
    }
});


const ticketSlice = createSlice({
    name: "tickets",
    initialState: {
        count: null,
        next: null,
        previous: null,
        ticketsList: [],
        loading: true,
        error: null,
    },
    reducers: {
        restTickets: (state, action) => {
            state.ticketsList = []
            state.loading = true
            state.error = null
            state.next = null
            state.previous = null
        },
        updateTicket: (state, action) => {
            const { id } = action.payload
            const findIndexTicket = state.ticketsList.findIndex(ticket => ticket.id === id)
            const changeState = state.ticketsList
            changeState[findIndexTicket] = action.payload
            state.ticketsList = changeState
        },
        updateComment: (state, action) => {
            const { id, comment } = action.payload
            const findIndexTicket = state.ticketsList.findIndex(note => note.id === id)
            const changeState = state.ticketsList
            changeState[findIndexTicket].comment = comment
            state.ticketsList = changeState
        }
    },
    extraReducers: {

        // handel get tickets
        [getTickets.pending]: (state, action) => {
            state.ticketsList = []
            state.count = null
            state.next = null
            state.previous = null
            state.loading = true
        },

        // handel get tickets
        [getTickets.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.ticketsList = results
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null

        },
        [getTickets.rejected]: (state, action) => {
            state.error = action.payload
            state.loading = null
            state.ticketsList = []
            state.next = null
            state.previous = null
        },
        [getMyTickets.pending]: (state, action) => {
            state.ticketsList = []
            state.count = null
            state.next = null
            state.previous = null
            state.loading = true
        },
        [getMyTickets.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.ticketsList = results
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null

        },
        [getMyTickets.rejected]: (state, action) => {
            state.error = action.payload
            state.loading = null
            state.ticketsList = []
            state.next = null
            state.previous = null
        },
        [transferTicket.fulfilled]: (state, action) => {
            const filterTicket = state.ticketsList.filter(item => !action.payload.includes(item.id));
            state.ticketsList = filterTicket
        },
        [ArchiveTicket.fulfilled]: (state, action) => {
            const filterTicket = state.ticketsList.filter((ticket) => {
                return ticket.id !== action.payload
            })
            state.ticketsList = filterTicket
        },
        [multipleArchiveTicket.fulfilled]: (state, action) => {
            const filterTicket = state.ticketsList.filter(item => {
            return !action.payload.includes(item.id) || item.status !== "complete"
            });
            state.ticketsList = filterTicket
        },
    }
});

export const { restTickets, updateTicket, updateComment } = ticketSlice.actions
export default ticketSlice.reducer