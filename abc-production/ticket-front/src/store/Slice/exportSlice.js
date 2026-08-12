import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchApi, fetchApiUrl } from "../../utils/crudApi";

export const getExports = createAsyncThunk("export/getExports", async (quarys, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const res = await fetchApi("router/export-files/", quarys);
    return res;
  } catch (error) {
    return rejectWithValue(error);
  }
}
);


export const getNextExports = createAsyncThunk("note/getNextExports", async (url, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const res = await fetchApiUrl(url);
    return res
  } catch (error) {
    return rejectWithValue(error);
  }
});


export const exportFils = createAsyncThunk("export/exportFils",
  async (quarys, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await fetchApi("export/", quarys);
      console.log(res);
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const exportSlice = createSlice({
  name: "export",
  initialState: {
    loading: true,
    error: null,
    next: null,
    previose: null,
    exportsList: [],
    exportLoading: 0,
  },
  reducers: {
    exporting: (state, action) => {
      state.exportLoading = action.payload
    },
  },
  extraReducers: {
    [getExports.pending]: (state, action) => {
      state.exportsList = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.loading = true;
      state.error = null;
    },
    [getExports.fulfilled]: (state, action) => {
      const { results, count, next, previous } = action.payload;
      state.exportsList = results;
      state.count = count;
      state.next = next;
      state.previous = previous;
      state.loading = null;
      state.error = null;
    },
    [getExports.rejected]: (state, action) => {
      console.log(action.payload);
      getExports.error = action.payload;
      state.loading = null;
      state.exportsList = [];
      state.next = null;
      state.previous = null;
    },
    // handel more data
    [getNextExports.fulfilled]: (state, action) => {
      const { results, count, next, previous } = action.payload
      state.exportsList.push(...results)
      state.count = count
      state.next = next
      state.previous = previous
      state.loading = null
      state.error = null
    },

  },
});

export const { exporting } = exportSlice.actions


export default exportSlice.reducer;