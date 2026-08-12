import { createSlice } from "@reduxjs/toolkit";



const transferSlice = createSlice({
    name: "transfer",
    initialState: { showTransfer: false, ticketId: null },
    reducers: {
        openTransfer: (state, action) => {
            state.showTransfer = true
            state.ticketId = action.payload
        },
        closeTransfer: (state, action) => {
            state.showTransfer = false
            state.ticketId = null
        },
    }

})

export const { openTransfer, closeTransfer } = transferSlice.actions
export default transferSlice.reducer