import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteApi, fetchApi, postApi } from "../../utils/crudApi";


export const getArchives = createAsyncThunk("archive/getArchives", async (quarys, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await fetchApi("router/restore-ticket/", quarys);
        return res
    } catch (error) {
        console.log(error);
        return rejectWithValue(error);
    }
});


export const deleteArchived = createAsyncThunk("archive/deleteArchived", async (ticketId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        await deleteApi(`router/restore-ticket/`, { id: ticketId });
        return ticketId

    } catch (error) {
        return rejectWithValue(error);
    }
});
export const restoreArchived = createAsyncThunk("archive/restoreArchived", async (ticketId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        await postApi(`router/restore-ticket/`, { id: ticketId });
        return ticketId

    } catch (error) {
        return rejectWithValue(error);
    }
});






const ticketSlice = createSlice({
    name: "archive",
    initialState: {
        count: null,
        next: null,
        previous: null,
        archiveList: [],
        loading: true,
        error: null,

    },
    reducers: {
        restArchives: (state, action) => {
            state.count = null
            state.next = null
            state.previous = null
            state.archiveList = []
            state.loading = true
            state.error = null
        },
    },
    extraReducers: {

        // handel get tickets
        [getArchives.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.archiveList = results
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null

        },
        [getArchives.rejected]: (state, action) => {
            state.error = action.payload
            state.loading = null
            state.archiveList = []
            state.next = null
            state.previous = null


        },

        // handel delete Archive Ticket
        [deleteArchived.fulfilled]: (state, action) => {
            const filterTicket = state.archiveList.filter(item => !action.payload.includes(item.id));
            state.archiveList = filterTicket
        },
        // handel post Archive Ticket
        [restoreArchived.fulfilled]: (state, action) => {
            const filterTicket = state.archiveList.filter(item => !action.payload.includes(item.id));
            state.archiveList = filterTicket
        },

    }
});

export const { restArchives } = ticketSlice.actions
export default ticketSlice.reducer