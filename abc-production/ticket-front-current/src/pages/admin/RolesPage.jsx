import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { t } from "i18next";
import { toast } from "sonner";
import {
  Button, Card, Checkbox, Chip, Modal, ModalBody, ModalContent, ModalFooter,
  ModalHeader, Select, SelectItem, Spinner, Tab, Tabs,
} from "@nextui-org/react";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineShieldCheck } from "react-icons/hi";

/**
 * Roles & permissions.
 *
 * Two surfaces:
 *  - permission SETS, which departments point at (the department default)
 *  - per-user OVERRIDES, tri-state: allow / deny / inherit
 */
export default function RolesPage() {
  const [flags, setFlags] = useState([]);
  const [sets, setSets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);   // permission set being edited
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [selectedUser, setSelectedUser] = useState("");
  const [effective, setEffective] = useState(null);
  const [override, setOverride] = useState({});

  const loadSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/catalog/permission-sets/");
      setSets(res?.results ?? res ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    axios.get("/catalog/permission-sets/flags/").then((r) => setFlags(r?.results ?? [])).catch(() => {});
    axios.get("/catalog/departments/").then((r) => setDepartments(r?.results ?? r ?? [])).catch(() => {});
    axios.get("/catalog/users/").then((r) => setUsers(r?.results ?? r ?? [])).catch(() => {});
    loadSets();
  }, [loadSets]);

  const openSet = (row) => {
    setEditing(row || {});
    setForm(
      flags.reduce((acc, f) => ({ ...acc, [f]: row ? Boolean(row[f]) : false }), {})
    );
  };

  const saveSet = async () => {
    setSaving(true);
    try {
      if (editing?.id) await axios.patch(`/catalog/permission-sets/${editing.id}/`, form);
      else await axios.post("/catalog/permission-sets/", form);
      toast.success(t("saved successfully"));
      setEditing(null);
      loadSets();
    } catch (e) {
      toast.error(typeof e === "string" ? e : t("something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  const assignDepartment = async (setId, departmentId) => {
    try {
      await axios.post(`/catalog/permission-sets/${setId}/assign_department/`, {
        department: departmentId,
      });
      toast.success(t("assigned successfully"));
      loadSets();
    } catch (e) {
      toast.error(typeof e === "string" ? e : t("something went wrong"));
    }
  };

  const loadEffective = async (userId) => {
    setSelectedUser(userId);
    if (!userId) return setEffective(null);
    try {
      const res = await axios.get(`/catalog/user-permissions/effective/?user=${userId}`);
      setEffective(res);
      const existing = await axios.get(`/catalog/user-permissions/?user=${userId}`);
      const rows = existing?.results ?? existing ?? [];
      setOverride(rows[0] || {});
    } catch {
      setEffective(null);
    }
  };

  const setTriState = (flag, value) => setOverride((s) => ({ ...s, [flag]: value }));

  const saveOverride = async () => {
    setSaving(true);
    try {
      const payload = { user: Number(selectedUser) };
      flags.forEach((f) => {
        payload[f] = override[f] === undefined ? null : override[f];
      });
      if (override.id) await axios.patch(`/catalog/user-permissions/${override.id}/`, payload);
      else await axios.post("/catalog/user-permissions/", payload);
      toast.success(t("saved successfully"));
      loadEffective(selectedUser);
    } catch (e) {
      toast.error(typeof e === "string" ? e : t("something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("roles & permissions")}</h1>
          <p className="page-subtitle">{t("who can do what, per department and per user")}</p>
        </div>
      </div>

      <Tabs aria-label={t("roles & permissions")}>
        {/* ---------------- permission sets ---------------- */}
        <Tab key="sets" title={t("permission sets")}>
          <div className="flex justify-end mb-3">
            <Button color="primary" size="sm" startContent={<HiOutlinePlus />} onPress={() => openSet(null)}>
              {t("add")}
            </Button>
          </div>

          {loading ? (
            <div className="py-16 box-center"><Spinner /></div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sets.map((row) => {
                const granted = flags.filter((f) => row[f]);
                return (
                  <Card key={row.id} radius="sm" shadow="sm" className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HiOutlineShieldCheck className="text-primary text-xl" />
                        <span className="font-semibold">{t("permission set")} #{row.id}</span>
                      </div>
                      <Button isIconOnly size="sm" variant="light" onPress={() => openSet(row)}>
                        <HiOutlinePencil />
                      </Button>
                    </div>

                    <p className="text-xs text-default-500 mb-2">
                      {granted.length} / {flags.length} {t("granted")}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {granted.slice(0, 5).map((f) => (
                        <Chip key={f} size="sm" variant="flat">{t(f)}</Chip>
                      ))}
                      {granted.length > 5 ? (
                        <Chip size="sm" variant="flat">+{granted.length - 5}</Chip>
                      ) : null}
                    </div>

                    <div className="mb-2">
                      <p className="text-xs text-default-500 mb-1">{t("departments")}</p>
                      <div className="flex flex-wrap gap-1">
                        {row.departments?.length
                          ? row.departments.map((d) => (
                              <Chip key={d.id} size="sm" color="primary" variant="flat">{d.name}</Chip>
                            ))
                          : <span className="text-xs text-default-400">{t("not assigned")}</span>}
                      </div>
                    </div>

                    <Select
                      aria-label={t("assign to department")}
                      size="sm"
                      placeholder={t("assign to department")}
                      onChange={(e) => e.target.value && assignDepartment(row.id, e.target.value)}
                    >
                      {departments.map((d) => (
                        <SelectItem key={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </Select>
                  </Card>
                );
              })}
              {!sets.length ? (
                <Card radius="sm" shadow="sm" className="p-8 text-center text-default-400 md:col-span-2 lg:col-span-3">
                  {t("no permission sets yet")}
                </Card>
              ) : null}
            </div>
          )}
        </Tab>

        {/* ---------------- per-user overrides ---------------- */}
        <Tab key="users" title={t("user overrides")}>
          <Card radius="sm" shadow="sm" className="p-4">
            <Select
              label={t("user")}
              className="max-w-sm mb-4"
              selectedKeys={selectedUser ? [String(selectedUser)] : []}
              onChange={(e) => loadEffective(e.target.value)}
            >
              {users.map((u) => (
                <SelectItem key={String(u.id)}>{u.full_name}</SelectItem>
              ))}
            </Select>

            {effective ? (
              <>
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <Chip size="sm" variant="flat">{t("role")}: {t(effective.role)}</Chip>
                  <span className="text-default-500">
                    {Object.values(effective.permissions).filter(Boolean).length} / {flags.length} {t("granted")}
                  </span>
                </div>

                {/* Four columns with a three-way switch per row cannot fit a
                    phone, so below `lg` each permission becomes its own block. */}
                <div className="border border-default-200 rounded-lg overflow-hidden mb-4">
                  <div className="hidden lg:grid grid-cols-4 bg-default-100 text-xs font-semibold p-2">
                    <span className="col-span-2">{t("permission")}</span>
                    <span>{t("effective")}</span>
                    <span>{t("override")}</span>
                  </div>
                  {flags.map((f) => (
                    <div
                      key={f}
                      className="flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-0 lg:items-center p-3 text-xs border-t border-default-100"
                    >
                      <div className="flex items-center justify-between gap-2 lg:col-span-2 lg:block">
                        <span className="text-sm lg:text-xs font-medium lg:font-normal">{t(f)}</span>
                        <Chip
                          className="lg:hidden"
                          size="sm"
                          variant="flat"
                          color={effective.permissions[f] ? "success" : "default"}
                        >
                          {t(effective.permissions[f] ? "allowed" : "denied")}
                        </Chip>
                      </div>
                      <span className="hidden lg:block">
                        <Chip size="sm" variant="flat" color={effective.permissions[f] ? "success" : "default"}>
                          {t(effective.permissions[f] ? "allowed" : "denied")}
                        </Chip>
                      </span>
                      <div className="grid grid-cols-3 gap-1 lg:flex">
                        <Button size="sm" variant={override[f] === true ? "solid" : "bordered"}
                                color="success" onPress={() => setTriState(f, true)}>
                          {t("allow")}
                        </Button>
                        <Button size="sm" variant={override[f] === false ? "solid" : "bordered"}
                                color="danger" onPress={() => setTriState(f, false)}>
                          {t("deny")}
                        </Button>
                        <Button size="sm" variant={override[f] == null ? "solid" : "bordered"}
                                onPress={() => setTriState(f, null)}>
                          {t("inherit")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button color="primary" isLoading={saving} onPress={saveOverride}>
                  {t("save")}
                </Button>
              </>
            ) : (
              <p className="text-sm text-default-400 py-8 text-center">{t("select a user")}</p>
            )}
          </Card>
        </Tab>
      </Tabs>

      {/* permission-set editor */}
      <Modal isOpen={Boolean(editing)} onOpenChange={() => setEditing(null)} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            {editing?.id ? `${t("edit")} — #${editing.id}` : t("new permission set")}
          </ModalHeader>
          <ModalBody>
            <div className="grid gap-2 sm:grid-cols-2">
              {flags.map((f) => (
                <Checkbox
                  key={f}
                  isSelected={Boolean(form[f])}
                  onValueChange={(v) => setForm((s) => ({ ...s, [f]: v }))}
                >
                  <span className="text-sm">{t(f)}</span>
                </Checkbox>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setEditing(null)}>{t("cancel")}</Button>
            <Button color="primary" isLoading={saving} onPress={saveSet}>{t("save")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
