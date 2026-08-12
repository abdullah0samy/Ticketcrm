import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchApi, postApi } from "../../utils/crudApi";

export const getDepartment = createAsyncThunk("hospital/getDepartment/", async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const { results } = await fetchApi("router/department/?reciever=true");
        return results
    } catch (error) {
        return rejectWithValue(error);
    }
});


export const getBuilding = createAsyncThunk("hospital/getBuilding/", async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const { data } = await fetchApi("building/");
        return data
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getFloor = createAsyncThunk("hospital/getFloor", async (value, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const { data } = await postApi("building/", { building: value });
   
        if (data) {
            return data
        } else {
            return []
        }
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getIssuetype = createAsyncThunk("hospital/getIssuetype", async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const { results } = await fetchApi(`router/issuetype/?me=true`);
        return results

    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getAllIssuetype = createAsyncThunk("hospital/getAllIssuetype", async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
        const { results } = await fetchApi("router/issuetype/?me=false");
        return results

    } catch (error) {
        return rejectWithValue(error);
    }
});


const initialState = {
    department: [],
    building: [],
    floor: [],
    allIssuetype: [],
    issuetype: [],
}

const hospitalSlice = createSlice({
    name: "hospital",
    initialState,
    reducers: {
        restHospital: (state, action) => {
            state.department = []
            state.building = []
            state.allIssuetype = []
            state.issuetype = []
        },
        clearFloor: (state, action) => {
            state.floor = []
        }
    },
    extraReducers: {
        [getDepartment.fulfilled]: (state, action) => {
            state.department = action.payload
        },
        [getDepartment.rejected]: (state, action) => {
            console.log(action.error.message);
        },

        [getBuilding.fulfilled]: (state, action) => {
            state.building = action.payload
        },
        [getBuilding.rejected]: (state, action) => {
            console.log(action.error.message);
        },

        [getFloor.fulfilled]: (state, action) => {
            state.floor = action.payload
        },
        [getFloor.rejected]: (state, action) => {
            state.floor = []
        },

        [getIssuetype.fulfilled]: (state, action) => {
            state.issuetype = action.payload
        },
        [getIssuetype.rejected]: (state, action) => {
            state.issuetype = []
        },

        [getAllIssuetype.fulfilled]: (state, action) => {
            state.allIssuetype = action.payload
        },
        [getAllIssuetype.rejected]: (state, action) => {
            state.allIssuetype = []
        },


    }

})

export const { clearFloor, restHospital } = hospitalSlice.actions

export default hospitalSlice.reducer