import { configureStore } from "@reduxjs/toolkit"
import userSlice from './Slice/userSlice';
import sidebarSlice from './Slice/sidebarSlice';
import hospitalSlice from './Slice/hospitalSlice';
import ticketSlice from './Slice/ticketSlice';
import statisticsSlice from "./Slice/statisticsSlice";
import archiveSlice from "./Slice/archiveSlice";
import noteSlice from './Slice/noteSlice';
import notificationSlice from "./Slice/notificationSlice";
import transferSlice from './Slice/transferSlice';
import ChatSlice from "./Slice/ChatSlice";
import exportSlice from './Slice/exportSlice';

const store = configureStore({
    reducer: {
        user: userSlice,
        Sidebar: sidebarSlice,
        hospital: hospitalSlice,
        tickets: ticketSlice,
        archive: archiveSlice,
        statistics: statisticsSlice,
        note: noteSlice,
        notification: notificationSlice,
        chat: ChatSlice,
        transfer: transferSlice,
        export: exportSlice,

    }
})

export default store