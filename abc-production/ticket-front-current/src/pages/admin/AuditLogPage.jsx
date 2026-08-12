import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { t } from "i18next";
import moment from "moment";
import {
  Button, Card, Chip, Modal, ModalBody, ModalContent, ModalHeader, Select,
  SelectItem, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader,
  TableRow,
} from "@nextui-org/react";
import { HiOutlineEye } from "react-icons/hi";

const ACTION_COLOR = (action = "") => {
  if (action.includes("DELETE")) return "danger";
  if (action.includes("CREATE")) return "success";
  if (action.includes("TRANSFER")) return "secondary";
  if (action.includes("STATUS") || action.includes("ASSIGN")) return "warning";
  return "primary";
};

/** Read-only system audit trail with an old → new diff viewer. */
export default function AuditLogPage() {
  const [rows, setRows] = useState([]);
  const [actions, setActions] = useState([]);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/catalog/audit-logs/", {
        params: { action: action || undefined },
      });
      setRows(res?.results ?? res ?? []);
    } finally {
      setLoading(false);
    }
  }, [action]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    axios
      .get("/catalog/audit-logs/actions/")
      .then((res) => setActions(res?.results ?? []))
      .catch(() => {});
  }, []);

  const diffKeys = selected
    ? Array.from(
        new Set([
          ...Object.keys(selected.old_data || {}),
          ...Object.keys(selected.new_data || {}),
        ])
      )
    : [];

  /**
   * Updates store the change itself — new_data[field] is [before, after].
   * Creates and deletes store a flat snapshot instead, so fall back to
   * old_data/new_data directly.
   */
  const cell = (key) => {
    const recorded = selected?.new_data?.[key];
    if (Array.isArray(recorded) && recorded.length === 2) {
      return { before: recorded[0], after: recorded[1] };
    }
    return { before: selected?.old_data?.[key], after: recorded };
  };

  const show = (value) =>
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

  return (
    <div className="py-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("audit logs")}</h1>
          <p className="page-subtitle">{t("who changed what, and when")}</p>
        </div>
        <Select
          aria-label={t("action")}
          size="sm"
          className="w-full sm:w-56"
          placeholder={t("all actions")}
          selectedKeys={action ? [action] : []}
          onChange={(e) => setAction(e.target.value)}
        >
          {actions.map((a) => (
            <SelectItem key={a}>{a}</SelectItem>
          ))}
        </Select>
      </div>

      {/* ------------------------ phones and tablets: one card per event */}
      <div className="lg:hidden">
        {loading ? (
          <div className="py-16 box-center"><Spinner /></div>
        ) : rows.length === 0 ? (
          <Card radius="sm" shadow="sm" className="py-12 text-center text-default-400">
            {t("no data")}
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <Card
                key={row.id}
                radius="lg"
                shadow="sm"
                isPressable
                onPress={() => setSelected(row)}
                className="p-3 w-full text-start"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Chip size="sm" variant="flat" color={ACTION_COLOR(row.action)}>
                    {row.action}
                  </Chip>
                  <span className="text-xs text-default-400 shrink-0">
                    {moment(row.created_at).format("MM-DD HH:mm")}
                  </span>
                </div>
                <p className="text-sm">
                  <span className="text-default-500">{row.entity_type}</span>
                  {row.entity_id ? <span className="text-default-400">#{row.entity_id}</span> : null}
                </p>
                <p className="text-xs text-default-500 mt-1">
                  {row.user_name || "—"}
                  {row.ip_address ? <span className="font-mono"> · {row.ip_address}</span> : null}
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
          <Table aria-label={t("audit logs")} removeWrapper>
            <TableHeader>
              <TableColumn>{t("action")}</TableColumn>
              <TableColumn>{t("entity")}</TableColumn>
              <TableColumn>{t("user")}</TableColumn>
              <TableColumn>{t("IP address")}</TableColumn>
              <TableColumn>{t("date")}</TableColumn>
              <TableColumn>{t("details")}</TableColumn>
            </TableHeader>
            <TableBody items={rows} emptyContent={t("no data")}>
              {(row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={ACTION_COLOR(row.action)}>
                      {row.action}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {row.entity_type}
                      {row.entity_id ? `#${row.entity_id}` : ""}
                    </span>
                  </TableCell>
                  <TableCell>{row.user_name || "—"}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{row.ip_address || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {moment(row.created_at).format("YYYY-MM-DD HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button isIconOnly size="sm" variant="light" onPress={() => setSelected(row)}>
                      <HiOutlineEye />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal isOpen={Boolean(selected)} onOpenChange={() => setSelected(null)} size="2xl">
        <ModalContent>
          <ModalHeader>
            {selected?.action} — {selected?.entity_type}#{selected?.entity_id}
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="text-sm space-y-1 mb-3">
              <p>
                <span className="text-default-500">{t("user")}: </span>
                {selected?.user_name || "—"}
              </p>
              <p>
                <span className="text-default-500">{t("date")}: </span>
                {selected ? moment(selected.created_at).format("YYYY-MM-DD HH:mm:ss") : ""}
              </p>
              <p className="break-all">
                <span className="text-default-500">{t("user agent")}: </span>
                <span className="text-xs">{selected?.user_agent || "—"}</span>
              </p>
            </div>

            {diffKeys.length ? (
              <div className="border border-default-200 rounded-lg overflow-hidden">
                {/* Three columns need the room; on a phone each field stacks. */}
                <div className="hidden sm:grid grid-cols-3 bg-default-100 text-xs font-semibold p-2">
                  <span>{t("field")}</span>
                  <span>{t("before")}</span>
                  <span>{t("after")}</span>
                </div>
                {diffKeys.map((k) => {
                  const { before, after } = cell(k);
                  const changed = show(before) !== show(after);
                  return (
                    <div
                      key={k}
                      className="flex flex-col gap-1 sm:grid sm:grid-cols-3 sm:gap-0 p-2 text-xs border-t border-default-100"
                    >
                      <span className="font-medium break-all">{k}</span>
                      <span className={`break-all ${changed ? "text-danger line-through" : "text-default-400"}`}>
                        <span className="sm:hidden text-default-400 me-1">{t("before")}:</span>
                        {show(before)}
                      </span>
                      <span className={`break-all ${changed ? "text-success" : ""}`}>
                        <span className="sm:hidden text-default-400 me-1">{t("after")}:</span>
                        {show(after)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-default-400">{t("no field changes recorded")}</p>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
