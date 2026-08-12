/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Guide from './pages/Guide';
import Error from './pages/Error';
import ReceiveTickets from './pages/ReceiveTickets';
import Statistics from './pages/Statistics';
import AddTicket from './pages/AddTicket';
import ArchiveTickets from "./pages/ArchiveTickets";
import { useTranslation } from 'react-i18next';
import ProtectPage from './components/ProtectPage';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from './store/Slice/userSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from "./components/layout/Loading";
import MyTickets from './pages/MyTickets';
import Tickets from './pages/Tickets';
import { getBuilding, getDepartment, getIssuetype, getAllIssuetype } from './store/Slice/hospitalSlice';
import { requestPermission } from './utils/requestPermission';
import Exports from './pages/Exports';
import { Socket } from "./utils/socket";


export const newSocket = new Socket();
function App() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch()

  useEffect(() => {
    async function getMainData() {
      try {
        await dispatch(getUser()).unwrap()
        requestPermission();
        await dispatch(getDepartment()).unwrap()
        dispatch(getBuilding())
        dispatch(getIssuetype())
        dispatch(getAllIssuetype())
        newSocket.connect()
        newSocket.onMessageWebSocket(dispatch)
      } catch (error) {
        console.log(error)
      }
    }
    getMainData()
  }, [dispatch])

  const { userLoad } = useSelector((state) => state.user)

  if (userLoad) return <Loading />

  return (
    <div className="app" dir={i18n.language === "ar" ? "rtl" : "ltr"} >
      <ToastContainer />
      <Routes>
        <Route path="/" element={<ProtectPage component={<Home />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<ProtectPage component={<Settings />} />} />
        <Route path="/tickets" element={<ProtectPage component={<Tickets />} />}>
          <Route path="sent" index element={<MyTickets />} />
          <Route path="receive" element={<ReceiveTickets />} />
        </Route>
        <Route path="/archive" element={<ProtectPage component={<ArchiveTickets />} />} />
        <Route path="/statistics" element={<ProtectPage component={<Statistics />} />} />
        <Route path="/addTicket" element={<ProtectPage component={<AddTicket />} />} />
        <Route path="/exports" element={<ProtectPage component={<Exports />} />} />
        <Route path="/guide" element={<ProtectPage component={<Guide />} />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>

  );
}

export default App;
