import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteApi, fetchApi, fetchApiUrl, patchApi, postApi } from "../../utils/crudApi";

export const getNotes = createAsyncThunk("note/getNotes", async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await fetchApi("router/note/");
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getNextNotes = createAsyncThunk("note/getNextNotes", async (url, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {

        const res = await fetchApiUrl(url);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const createNote = createAsyncThunk("note/createNote", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await postApi("router/note/", data);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});


export const deleteNote = createAsyncThunk("note/deleteNote", async (noteId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        await deleteApi(`router/note/${noteId}/`);
        return noteId
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const edtieNote = createAsyncThunk("note/deleteNote", async (data, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    const { sendData, noteId } = data;
    console.log(sendData);
    try {
        const res = await patchApi(`router/note/${noteId}/`, sendData);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});


const initialState = {
    count: null,
    next: null,
    previous: null,
    noteList: [],
    loading: true,
    error: null,
}
const noteSlice = createSlice({
    name: "note",
    initialState,
    reducers: {
        restNote: (state, action) => {
            state.noteList = []
            state.loading = true
            state.error = null
        },
        updateNote: (state, action) => {
            const { id } = action.payload
            const findIndexNote = state.noteList.findIndex(note => note.id === id)
            const changeState = state.noteList
            changeState[findIndexNote] = action.payload
            state.noteList = changeState
        }
    },
    extraReducers: {
        // handel get note
        [getNotes.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.noteList = results
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null

        },
        [getNotes.rejected]: (state, action) => {
            state.error = action.payload
            state.loading = null
            state.noteList = []
            state.next = null
            state.previous = null
        },

        // handel delete note
        [deleteNote.fulfilled]: (state, action) => {
            const filterNote = state.noteList.filter((note) => {
                return note.id !== action.payload
            })
            state.noteList = filterNote
            if (state.noteList.length < 8) {
                state.next = null
            }

        },
        // handel delete note
        [createNote.fulfilled]: (state, action) => {
            state.noteList.unshift(action.payload)
        },

        // handel more note
        [getNextNotes.fulfilled]: (state, action) => {
            const { results, count, next, previous } = action.payload
            state.noteList.push(...results)
            state.count = count
            state.next = next
            state.previous = previous
            state.loading = null
            state.error = null
        },

    }
})

export const { updateNote, restNote } = noteSlice.actions
export default noteSlice.reducer