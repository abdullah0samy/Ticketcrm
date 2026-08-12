import React, { useMemo, useState, useCallback } from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { Eye, ArchiveClose, Archive } from "../../Icons";
import ViewTicketModel from "../../Modal/ViewTicketModel";
import { useDispatch, useSelector } from "react-redux";
import IssueTypeModal from "../../Modal/IssueTypeModal";
import { ArchiveTicket } from "../../../store/Slice/ticketSlice";
import { toast } from "react-toastify";
import moment from "moment";
import { t } from "i18next";
import UserAvatar from "../../elements/UserAvatar";
import Swal from "sweetalert2";

function TicketRow({ ticketData, isChecked, handleClick }) {
  const {
    id,
    building,
    complaint,
    floor,
    extension,
    status,
    issuetype,
    created_at,
  } = ticketData;

  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  const DataMemo = useMemo(() => {
    return ticketData;
  }, [ticketData]);

  const [modalShowViwe, setModalShowViwe] = useState(false);
  const [modalShowIssueType, setModalShowIssueType] = useState(false);

  // handel open and close Viwe ticket modal
  const openModelViwe = useCallback(() => {
    setModalShowViwe(true);
  }, []);

  const CloseModelViwe = useCallback(() => {
    setModalShowViwe(false);
  }, []);

  // handel open and close Issue Type modal
  const openModelIssueType = () => setModalShowIssueType(true);
  const CloseModelIssueType = () => setModalShowIssueType(false);

  const handelArchive = async () => {
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
        await dispatch(ArchiveTicket(id)).unwrap();
        toast.success(t("archive ticket success"), {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <>
      <ViewTicketModel
        ticketData={DataMemo}
        show={modalShowViwe}
        onHide={CloseModelViwe}
        is_superuser={userData.is_superuser}
      />
      <IssueTypeModal
        ticketId={id}
        show={modalShowIssueType}
        onHide={CloseModelIssueType}
      />
      <tr>
        <td>{id}</td>
        <td>
          <Form.Check
            type="checkbox"
            value={id}
            id={id}
            checked={isChecked.includes(id)}
            onChange={handleClick}
          />
        </td>
        <td>
          <UserAvatar
            img={complaint.image}
            name={complaint.name}
            subTitle={complaint.department}
          />
        </td>
        <td>{t(building)}</td>
        <td>{t(floor)}</td>
        <td>{extension}</td>
        <td>
          <span
            className={`badge ${
              status === "on hold"
                ? "bg-danger"
                : status === "complete"
                ? "bg-success"
                : "bg-warning"
            }  p-2`}
          >
            {t(status)}
          </span>
        </td>
        <td>{issuetype ? issuetype.name : t("unknown")}</td>
        <td>{moment(created_at).format("l LT")}</td>
        <td>
          <Stack direction="horizontal" gap={1}>
            <Button className="p-1" size="sm" onClick={openModelViwe}>
              <Eye width="22px" />
            </Button>
            {userData.is_superuser ? (
              <>
                <Button
                  className="p-1"
                  variant="dark"
                  size="sm"
                  onClick={openModelIssueType}
                >
                  <ArchiveClose />
                </Button>
                <Button
                  className="p-1"
                  variant="danger"
                  size="sm"
                  onClick={handelArchive}
                >
                  <Archive />
                </Button>
              </>
            ) : null}
          </Stack>
        </td>
      </tr>
    </>
  );
}

export default TicketRow;
