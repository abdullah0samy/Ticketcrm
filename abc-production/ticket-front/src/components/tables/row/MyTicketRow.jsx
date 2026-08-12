import React, { useMemo, useState, useCallback } from "react";
import { Button, Stack } from "react-bootstrap";
import { Eye } from "../../Icons";
import ViewTicketModel from "../../Modal/ViewTicketModel";
import moment from "moment";
import { t } from "i18next";

function MyTicketRow({ ticketData }) {
  const {
    building,
    issuetype,
    floor,
    extension,
    status,
    department,
    created_at,
    id,
  } = ticketData;

  const DataMemo = useMemo(() => {
    return ticketData;
  }, [ticketData]);

  const [modalShowViwe, setModalShowViwe] = useState(false);

  // handel open and close Viwe ticket modal
  const openModelViwe = useCallback(() => {
    setModalShowViwe(true);
  }, []);

  const CloseModelViwe = useCallback(() => {
    setModalShowViwe(false);
  }, []);

  return (
    <>
      <ViewTicketModel
        ticketData={DataMemo}
        show={modalShowViwe}
        onHide={CloseModelViwe}
        is_superuser={false}
        is_mine={true}
      />
      <tr>
        <td>{id}</td>
        <td>{department.name}</td>
        <td className="building">{t(building)}</td>
        <td className="floor">{t(floor)}</td>
        
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
        <td className="date">{moment(created_at).format("l LT")}</td>
        <td className="action">
          <Stack direction="horizontal" gap={1}>
            <Button size="sm" onClick={openModelViwe}>
              <Eye width="22px" />
            </Button>
          </Stack>
        </td>
      </tr>
    </>
  );
}

export default MyTicketRow;
