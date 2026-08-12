import { configureStore } from "@reduxjs/toolkit";
import accountSlice from "./slices/accountSlice";
import postsSlice from "./slices/postsSlice";
import ticketsSlice from "./slices/ticketsSlice";
import exportsSlice from "./slices/exportsSlice";
import archiveSlice from "./slices/archiveSlice";
import ticketProfileSlice from "./slices/ticketProfileSlice";
import notificationsSlice from "./slices/notificationsSlice";
import summarySlice from "./slices/summarySlice";
import chatSlice from "./slices/chatSlice";
import surveysSlice from "./slices/surveysSlice";
import prDashboardSlice from "./slices/prDashboardSlice";
import dashboardSlice from "./slices/dashboardSlice";

const store = configureStore({
  reducer: {
    account: accountSlice,
    posts: postsSlice,
    tickets: ticketsSlice,
    archive: archiveSlice,
    exports: exportsSlice,
    ticketProfile: ticketProfileSlice,
    notifications: notificationsSlice,
    summary: summarySlice,
    dashboard: dashboardSlice,
    chat: chatSlice,
    surveys: surveysSlice,
    prDashboard: prDashboardSlice,
  },
});

export default store;
