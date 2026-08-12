import { useContext, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { requestPermission } from "./utils/requestPermission";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "./redux/actions/accountActions";
import { webSocketContext } from "./socket-context";
import CanView from "./components/common/CanView";

import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
// ticket page
import RootLayout from "./components/layout/RootLayout";
import PostsPage from "./pages/ticket/PostsPage";
import GuidePage from "./pages/ticket/GuidePage";
import ExportsPage from "./pages/ticket/ExportsPage";
import StatisticsPage from "./pages/ticket/StatisticsPage";
import DashboardPage from "./pages/ticket/DashboardPage";
import TransferredPage from "./pages/ticket/TransferredPage";
import KnowledgePage from "./pages/ticket/KnowledgePage";
import BuildingsPage from "./pages/admin/BuildingsPage";
import FloorsPage from "./pages/admin/FloorsPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import TicketTypesPage from "./pages/admin/TicketTypesPage";
import UsersPage from "./pages/admin/UsersPage";
import AssetsPage from "./pages/admin/AssetsPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import RolesPage from "./pages/admin/RolesPage";

import TicketsReceivedPage from "./pages/ticket/TicketsReceivedPage";
import SentTicketsPage from "./pages/ticket/SentTicketsPage";
import AddTicket from "./pages/ticket/AddTicket";
import ArchivedTicketsPage from "./pages/ticket/ArchivedTicketsPage";
import ScreenLoading from "./components/layout/ScreenLoading";
import AppError from "./components/common/AppError";
import ExternalRedirect from "./components/common/ExternalRedirect";
// PR screens now live in their own app: E:/Ticket System/pr-system (http://localhost:3002)

function App() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.account);
  const { onMessageWebSocket, connectSocket } = useContext(webSocketContext);
  document.body.dir = i18n.dir();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* PR moved to its own app; keep old links working. */}
        <Route
          path="/pr/*"
          element={
            <ExternalRedirect
              base={process.env.REACT_APP_PR_APP_URL || "http://localhost:3002"}
              strip="/pr"
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootLayout />} errorElement={<AppError />}>
          {/* Profile lives inside the layout like every other page; it used to
              be a top-level route with its own header and no sidebar. */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/"
            element={
              <CanView allowed={["manager", "agent"]} isPage isReciever>
                <PostsPage />
              </CanView>
            }
          />
          <Route
            path="/tickets/receive"
            element={
              <CanView allowed={["manager", "agent"]} isPage>
                <TicketsReceivedPage />
              </CanView>
            }
          />
          <Route
            path="/dashboard"
            element={
              <CanView allowed={["administration", "manager", "agent"]} isPage>
                <DashboardPage />
              </CanView>
            }
          />
          <Route path="/tickets/transferred" element={<TransferredPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route
            path="/admin/buildings"
            element={<CanView allowed={["administration"]} isPage><BuildingsPage /></CanView>}
          />
          <Route
            path="/admin/floors"
            element={<CanView allowed={["administration"]} isPage><FloorsPage /></CanView>}
          />
          <Route
            path="/admin/departments"
            element={<CanView allowed={["administration"]} isPage><DepartmentsPage /></CanView>}
          />
          <Route
            path="/admin/ticket-types"
            element={<CanView allowed={["administration"]} isPage><TicketTypesPage /></CanView>}
          />
          <Route
            path="/admin/users"
            element={<CanView allowed={["administration"]} isPage><UsersPage /></CanView>}
          />
          <Route
            path="/admin/assets"
            element={<CanView allowed={["administration", "manager"]} isPage><AssetsPage /></CanView>}
          />
          <Route
            path="/admin/roles"
            element={<CanView allowed={["administration"]} isPage><RolesPage /></CanView>}
          />
          <Route
            path="/admin/audit"
            element={<CanView allowed={["administration"]} isPage><AuditLogPage /></CanView>}
          />
          <Route path="/tickets/sent" element={<SentTicketsPage />} />
          <Route
            path="/tickets/archive"
            element={
              <CanView allowed={["manager"]} isPage>
                <ArchivedTicketsPage />
              </CanView>
            }
          />
          <Route path="/tickets/add" element={<AddTicket />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route
            path="/exports"
            element={
              <CanView allowed={["manager", "administration"]} isPage>
                <ExportsPage />
              </CanView>
            }
          />
          <Route
            path="/statistics"
            element={
              <CanView allowed={["manager", "administration"]} isPage>
                <StatisticsPage />
              </CanView>
            }
          />
        </Route>
        <Route path="*" element={<AppError />} />
      </>
    )
  );

  useEffect(() => {
    dispatch(getProfile())
      .unwrap()
      .then(() => {
        connectSocket();
        onMessageWebSocket();
        requestPermission();
      })
      .catch((error) => {
        console.log(error);
      });
  }, [dispatch, connectSocket, onMessageWebSocket]);

  if (isLoading) return <ScreenLoading />;

  return (
    <div>
      <Toaster richColors dir={i18n.dir()} />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
