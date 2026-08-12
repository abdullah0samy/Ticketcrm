import { configureStore } from "@reduxjs/toolkit";

import accountSlice from "./slices/accountSlice";
import surveysSlice from "./slices/surveysSlice";
import prDashboardSlice from "./slices/prDashboardSlice";

/**
 * Only the slices the PR app actually needs.
 *
 * The ticketing store carried ten more (tickets, archive, exports, chat, posts,
 * notifications, summary, ticketProfile) — none of which this app renders.
 */
const store = configureStore({
  reducer: {
    account: accountSlice,
    surveys: surveysSlice,
    prDashboard: prDashboardSlice,
  },
});

export default store;
