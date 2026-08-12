import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchApi } from "../../utils/crudApi";

export const getStatistics = createAsyncThunk("statistics/getStatistics", async (quarys, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const res = await fetchApi(`summary/`, quarys);
        return res
    } catch (error) {
        return rejectWithValue(error);
    }
});

const statisticsSlice = createSlice({
    name: "statistics",
    initialState: {
        statistics: {
            tickets: {
                all: {
                    count: 0,
                    rate: 0
                },
                on_hold: {
                    count: 0,
                    percent: 0
                },
                in_progress: {
                    count: 0,
                    percent: 0
                },
                complete: {
                    count: 0,
                    percent: 0
                },
            },
            most_issuetypes: [],
            most_departments: [],
        },
        issues: [],
        loading: true,
        error: null
    },
    reducers: {
        filterIssues: (state, action) => {
            const filterition = state.statistics.most_issuetypes.find((el) => {
                return el.issuetype === action.payload
            })
            state.issues = filterition.issues
        }
    },
    extraReducers: {
        [getStatistics.pending]: (state, action) => {
            state.loading = true
            state.statistics.most_issuetypes = []
            state.statistics.most_departments = []
        },
        [getStatistics.fulfilled]: (state, action) => {
            state.statistics = action.payload
            state.loading = null
            state.error = null
        },
        [getStatistics.rejected]: (state, action) => {
            state.error = action.payload
            state.loading = null
        },
    }

})

export const { filterIssues } = statisticsSlice.actions
export default statisticsSlice.reducer