import React, { useState } from "react";
import TicketFilter from "../components/layout/TicketFilter";
import Pagination from "../components/elements/Pagination";
import ReceiveTicketsTable from "../components/tables/ReceiveTicketsTable";
import { useDispatch, useSelector } from "react-redux";
import { Button, Stack } from "react-bootstrap";
import { openTransfer } from "../store/Slice/transferSlice";
import { multipleArchiveTicket } from "../store/Slice/ticketSlice";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import { t } from "i18next";
import Swal from "sweetalert2";

function ViewTickets() {
  const { ticketsList, next, previous, count } = useSelector(
    (state) => state.tickets
  );

  const {
    userData: { is_superuser, department },
  } = useSelector((state) => state.user);

  const [isCheck, setIsCheck] = useState([]);
  const dispatch = useDispatch();

  const multipleTransfer = () => {
    dispatch(openTransfer(isCheck));
    setIsCheck([]);
  };

  const multipleArchive = async () => {
    try {
      const res = await Swal.fire({
        title: t("swal title"),
        showCancelButton: true,
        icon: "info",
        confirmButtonText: t("yes"),
        cancelButtonText: t("cancel"),
        confirmButtonColor: "#198754",
        cancelButtonColor: "#dc3545",
      });
      if (res.isConfirmed) {
        await dispatch(multipleArchiveTicket(isCheck)).unwrap();
        toast.success(t("multiple archive success"), {
          position: toast.POSITION.TOP_RIGHT,
        });
        setIsCheck([]);
      }
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };


  if (!department.reciever || department.id === 0) {
    return <Navigate to="/tickets/sent/?page=1&size=10" />;
  }

  return (
    <>
      <TicketFilter is_mine={true} />
      <div className="p-3 mt-3 card">
        <ReceiveTicketsTable isCheck={isCheck} setIsCheck={setIsCheck} />
        <div className="mt-4 d-flex justify-content-between align-items-center">
          <p className="mb-0 fs-text">
            {t("total number")} {count}
          </p>
          <p className="mb-0 fs-text">
            {t("selected")} {isCheck.length} {t("from")} {ticketsList.length}
          </p>
        </div>
        <Pagination next={next} previous={previous} />
        {is_superuser && (
          <Stack direction="horizontal" className="mt-3 center gap-3">
            <Button
              className="px-md-4"
              variant="dark"
              onClick={multipleTransfer}
              disabled={isCheck.length === 0}
            >
              {t("transfer selected")}
            </Button>
            <Button
              className="px-md-4"
              variant="danger"
              onClick={multipleArchive}
              disabled={isCheck.length === 0}
            >
              {t("archived selected")}
            </Button>
          </Stack>
        )}
      </div>
    </>
  );
}

export default ViewTickets;
