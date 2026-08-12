import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { t } from "i18next";
import { toast } from "sonner";
import {
  Button, Card, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter,
  ModalHeader, Select, SelectItem, Spinner, Switch, Table, TableBody,
  TableCell, TableColumn, TableHeader, TableRow, Tooltip,
} from "@nextui-org/react";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";

/**
 * Reusable admin CRUD screen.
 *
 * Every reference-data page (buildings, floors, departments, ticket types,
 * users, assets, KB categories) is the same shape — list, search, create/edit
 * modal, delete — so they share this component and only declare their columns
 * and form fields.
 *
 * `fields` entries: { name, label, type?: text|number|textarea|select|switch|date,
 *                     options?, required?, hideInTable?, render? }
 */
export default function AdminCrudPage({
  title,
  endpoint,           // e.g. "/catalog/buildings/"
  columns,            // [{ key, label, render? }]
  fields,
  canDelete = true,
  emptyText,
  extraQuery = {},
  titleKey,           // column shown as the heading of each mobile card
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const queryKey = JSON.stringify(extraQuery);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(endpoint, {
        params: { search: search || undefined, ...JSON.parse(queryKey) },
      });
      setRows(res?.results ?? res ?? []);
    } catch (err) {
      setError(typeof err === "string" ? err : t("something went wrong"));
    } finally {
      setLoading(false);
    }
  }, [endpoint, search, queryKey]);

  useEffect(() => {
    const id = setTimeout(load, search ? 300 : 0); // debounce typing only
    return () => clearTimeout(id);
  }, [load, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(
      fields.reduce((acc, f) => ({ ...acc, [f.name]: f.type === "switch" ? true : "" }), {})
    );
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(fields.reduce((acc, f) => ({ ...acc, [f.name]: row[f.name] ?? "" }), {}));
    setOpen(true);
  };

  const save = async () => {
    const missing = fields.filter((f) => f.required && form[f.name] === "");
    if (missing.length) {
      toast.error(`${t("required")}: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      // don't send an empty password on edit — it would clear it
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      if (editing) await axios.patch(`${endpoint}${editing.id}/`, payload);
      else await axios.post(endpoint, payload);
      toast.success(t(editing ? "updated successfully" : "created successfully"));
      setOpen(false);
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : t("something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(t("are you sure?"))) return;
    try {
      await axios.delete(`${endpoint}${row.id}/`);
      toast.success(t("deleted successfully"));
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : t("something went wrong"));
    }
  };

  const tableColumns = useMemo(
    () => [...columns, { key: "__actions", label: t("actions") }],
    [columns]
  );

  // What names each record on a phone card. Falls back to the first column,
  // which is right for reference data but wrong where column one is an ID.
  const headingColumn =
    columns.find((c) => c.key === titleKey) || columns[0] || { key: "id" };

  /** A cell's displayed content, shared by the table and the mobile cards. */
  const renderValue = (row, col) => {
    const custom = columns.find((c) => c.key === col.key)?.render?.(row);
    if (custom !== undefined && custom !== null) return custom;
    if (typeof row[col.key] === "boolean") {
      return (
        <Chip size="sm" variant="flat" color={row[col.key] ? "success" : "default"}>
          {t(row[col.key] ? "active" : "inactive")}
        </Chip>
      );
    }
    return row[col.key] ?? "—";
  };

  const rowActions = (row) => (
    <div className="flex gap-1">
      <Tooltip content={t("edit")}>
        <Button isIconOnly size="sm" variant="light" onPress={() => openEdit(row)}>
          <HiOutlinePencil />
        </Button>
      </Tooltip>
      {canDelete ? (
        <Tooltip content={t("delete")} color="danger">
          <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => remove(row)}>
            <HiOutlineTrash />
          </Button>
        </Tooltip>
      ) : null}
    </div>
  );

  return (
    <div className="py-4">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {/* On phones the search takes the row and the button sits beside it,
            rather than the two of them being squeezed onto one line. */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            size="sm"
            className="flex-1 sm:flex-none sm:w-56"
            placeholder={t("search")}
            startContent={<HiOutlineSearch />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            isClearable
            onClear={() => setSearch("")}
          />
          <Button
            color="primary"
            size="sm"
            className="shrink-0 h-10"
            startContent={<HiOutlinePlus />}
            onPress={openCreate}
          >
            {t("add")}
          </Button>
        </div>
      </div>

      {/* -------------------------------- phones and tablets: stacked cards
          The switch is at `lg`, not `md`: the sidebar eats 240px, so a
          six-column table still needs sideways scrolling on a 768px tablet. */}
      <div className="lg:hidden">
        {loading ? (
          <div className="py-16 box-center"><Spinner /></div>
        ) : error ? (
          <p className="py-16 text-center text-danger">{error}</p>
        ) : rows.length === 0 ? (
          <Card radius="sm" shadow="sm" className="py-12 text-center text-default-400">
            {emptyText || t("no data")}
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row) => (
              <Card key={row.id} radius="lg" shadow="sm" className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm break-words">
                    {renderValue(row, headingColumn)}
                  </span>
                  {rowActions(row)}
                </div>
                <div className="flex flex-col divide-y divide-default-100">
                  {columns.filter((c) => c.key !== headingColumn.key).map((col) => (
                    <div key={col.key} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-xs font-semibold uppercase text-default-400 shrink-0">
                        {col.label}
                      </span>
                      <span className="text-sm text-right break-words">
                        {renderValue(row, col)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ----------------------------------------------- desktop: a table */}
      <Card radius="sm" shadow="sm" className="p-1 hidden lg:block">
        {loading ? (
          <div className="py-16 box-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="py-16 text-center text-danger">{error}</p>
        ) : (
          <Table aria-label={title} removeWrapper>
            <TableHeader columns={tableColumns}>
              {(col) => <TableColumn key={col.key}>{col.label}</TableColumn>}
            </TableHeader>
            <TableBody
              items={rows}
              emptyContent={emptyText || t("no data")}
            >
              {(row) => (
                <TableRow key={row.id}>
                  {(colKey) => (
                    <TableCell>
                      {colKey === "__actions"
                        ? rowActions(row)
                        : renderValue(row, { key: colKey })}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal isOpen={open} onOpenChange={setOpen} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="capitalize">
            {editing ? t("edit") : t("add")} — {title}
          </ModalHeader>
          <ModalBody className="gap-3">
            {fields.map((f) => {
              const value = form[f.name];
              if (f.type === "switch") {
                return (
                  <Switch
                    key={f.name}
                    isSelected={Boolean(value)}
                    onValueChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))}
                  >
                    {f.label}
                  </Switch>
                );
              }
              if (f.type === "select") {
                return (
                  <Select
                    key={f.name}
                    label={f.label}
                    selectedKeys={value ? [String(value)] : []}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  >
                    {(f.options || []).map((o) => (
                      <SelectItem key={String(o.value)}>{o.label}</SelectItem>
                    ))}
                  </Select>
                );
              }
              return (
                <Input
                  key={f.name}
                  label={f.label}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "password" ? "password" : "text"}
                  value={value ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  isRequired={f.required}
                />
              );
            })}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button color="primary" isLoading={saving} onPress={save}>
              {t("save")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
