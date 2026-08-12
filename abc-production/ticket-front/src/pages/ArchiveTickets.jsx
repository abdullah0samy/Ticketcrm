import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import TicketFilter from "../components/layout/TicketFilter";
import ArchiveTable from "./../components/tables/ArchiveTable";
import Pagination from "./../components/elements/Pagination";
import { Button, Stack } from "react-bootstrap";
import { restoreArchived } from "../store/Slice/archiveSlice";
import { toast } from "react-toastify";
import { t } from "i18next";
import Swal from "sweetalert2";

function ArchiveTickets() {
  const {
    userData: { is_superuser, department },
  } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [isCheck, setIsCheck] = useState([]);

  const { archiveList, next, previous, count } = useSelector(
    (state) => state.archive
  );

  const restoreSelected = async () => {
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
        await dispatch(restoreArchived(isCheck)).unwrap();
        toast.success(t("restore ticket success"), {
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

  if (!is_superuser || !department.reciever || department.id === 0) {
    return <Navigate to="/tickets/sent/?page=1&size=10" />;
  }

  return (
    <>
      <TicketFilter is_mine={true} />
      <div className="p-3 mt-3 card">
        <ArchiveTable isCheck={isCheck} setIsCheck={setIsCheck} />
        <div className="mt-4 d-flex justify-content-between align-items-center">
          <p className="mb-0 fs-text">
            {t("total number")} {count}
          </p>
          <p className="mb-0 fs-text">
            {t("selected")} {isCheck.length} {t("from")} {archiveList.length}
          </p>
        </div>
        <Pagination next={next} previous={previous} />
        <Stack direction="horizontal" className="mt-3 center gap-3">
          <Button
            variant="success"
            disabled={isCheck.length === 0}
            onClick={restoreSelected}
          >
            {t("restore selected")}
          </Button>
        </Stack>
      </div>
    </>
  );
}

export default ArchiveTickets;
