import { createSlice } from "@reduxjs/toolkit";



const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: { isOpen: false },
    reducers: {
        openSidebar: (state, action) => {
            state.isOpen = true
        },
        closeSidebar: (state, action) => {
            state.isOpen = false
        }
    }

})

export const { openSidebar, closeSidebar } = sidebarSlice.actions
export default sidebarSlice.reducer