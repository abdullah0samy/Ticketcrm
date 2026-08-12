import { t } from "i18next";
import React from "react";

function IssuesTicketRow({
  complaint_name,
  Description,
  status,
  building,
  floor,
  extension,
}) {
  return (
    <tr>
      <td>{complaint_name || "unknown"}</td>
      <td className="Description">{Description}</td>
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
    </tr>
  );
}

export default IssuesTicketRow;
