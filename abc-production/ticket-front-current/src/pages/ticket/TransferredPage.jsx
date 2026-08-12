import React, { useEffect, useState } from "react";
import axios from "axios";
import { t } from "i18next";
import moment from "moment";
import {
  Card, Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader,
  TableRow, Tooltip,
} from "@nextui-org/react";
import { HiOutlineArrowNarrowRight, HiOutlineInformationCircle } from "react-icons/hi";

const PRIORITY_COLOR = { low: "default", normal: "primary", high: "warning", critical: "danger" };

/**
 * Tickets that moved between departments.
 *
 * This is now possible because transfers are recorded: the endpoint used to
 * mutate the ticket in place (and delete its history), leaving nothing to list.
 */
export default function TransferredPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/ticket/router/transfers/")
      .then((res) => {
        if (!cancelled) setRows(res?.results ?? res ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** The from → to chips, shared by the table and the phone cards. */
  const route = (row) => (
    <div className="flex items-center gap-2 text-xs flex-wrap">
      <Chip size="sm" variant="flat">
        {row.from_department_name || "—"}
      </Chip>
      <HiOutlineArrowNarrowRight className="rtl:rotate-180 text-default-400" />
      <Chip size="sm" variant="flat" color="primary">
        {row.to_department_name}
      </Chip>
      {row.fresh_start ? (
        <Tooltip content={t("earlier correspondence is collapsed for the new department")}>
          <span className="text-default-400">
            <HiOutlineInformationCircle />
          </span>
        </Tooltip>
      ) : null}
    </div>
  );

  return (
    <div className="py-4">
      <div className="mb-4">
        <h1 className="page-title">{t("transferred tickets")}</h1>
        <p className="page-subtitle">
          {t("tickets moved between departments")}
        </p>
      </div>

      {/* ------------------------- phones and tablets: one card per transfer */}
      <div className="lg:hidden">
        {loading ? (
          <div className="py-16 box-center"><Spinner /></div>
        ) : rows.length === 0 ? (
          <Card radius="sm" shadow="sm" className="py-12 text-center text-default-400">
            {t("no transfers yet")}
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row) => (
              <Card key={row.id} radius="lg" shadow="sm" className="p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-default-500">
                    {row.ticket_number || `#${row.ticket}`}
                  </span>
                  <Chip size="sm" variant="flat" color={PRIORITY_COLOR[row.ticket_priority] || "default"}>
                    {t(row.ticket_priority || "normal")}
                  </Chip>
                </div>
                <p className="text-sm mb-2 break-words">{row.ticket_description}</p>
                {route(row)}
                <p className="text-xs text-default-400 mt-2">
                  {row.transferred_by_name || "—"} · {moment(row.created_at).format("YYYY-MM-DD HH:mm")}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card radius="sm" shadow="sm" className="p-1 hidden lg:block">
        {loading ? (
          <div className="py-16 box-center">
            <Spinner />
          </div>
        ) : (
          <Table aria-label={t("transferred tickets")} removeWrapper>
            <TableHeader>
              <TableColumn>{t("ticket")}</TableColumn>
              <TableColumn>{t("description")}</TableColumn>
              <TableColumn>{t("route")}</TableColumn>
              <TableColumn>{t("priority")}</TableColumn>
              <TableColumn>{t("transferred by")}</TableColumn>
              <TableColumn>{t("date")}</TableColumn>
            </TableHeader>
            <TableBody items={rows} emptyContent={t("no transfers yet")}>
              {(row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <span className="font-mono text-xs">{row.ticket_number || `#${row.ticket}`}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm line-clamp-1 max-w-xs">
                      {row.ticket_description}
                    </span>
                  </TableCell>
                  <TableCell>{route(row)}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={PRIORITY_COLOR[row.ticket_priority] || "default"}>
                      {t(row.ticket_priority || "normal")}
                    </Chip>
                  </TableCell>
                  <TableCell>{row.transferred_by_name || "—"}</TableCell>
                  <TableCell>
                    <span className="text-xs">{moment(row.created_at).format("YYYY-MM-DD HH:mm")}</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
