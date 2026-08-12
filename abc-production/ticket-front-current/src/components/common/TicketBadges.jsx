import React from "react";
import { Chip, Tooltip } from "@nextui-org/react";
import { t } from "i18next";
import moment from "moment";
import { HiOutlineExclamation, HiOutlineUser } from "react-icons/hi";

const PRIORITY_COLOR = {
  low: "default",
  normal: "primary",
  high: "warning",
  critical: "danger",
};

/** Coloured priority pill. */
export function PriorityChip({ priority }) {
  if (!priority) return <span className="text-default-300">—</span>;
  return (
    <Chip size="sm" variant="flat" color={PRIORITY_COLOR[priority] || "default"}>
      {t(priority)}
    </Chip>
  );
}

/**
 * SLA indicator.
 *
 * `sla_state` is computed server-side (ok / warning / breached / met) so the
 * table doesn't have to re-derive deadlines from timestamps.
 */
export function SlaChip({ state, deadline }) {
  if (!state) return <span className="text-default-300">—</span>;

  const map = {
    ok: { color: "success", label: t("on track") },
    warning: { color: "warning", label: t("due soon") },
    breached: { color: "danger", label: t("breached") },
    met: { color: "success", label: t("met") },
  };
  const cfg = map[state] || { color: "default", label: state };

  return (
    <Tooltip
      content={
        deadline
          ? `${t("SLA deadline")}: ${moment(deadline).format("YYYY-MM-DD HH:mm")}`
          : cfg.label
      }
    >
      <Chip
        size="sm"
        variant="flat"
        color={cfg.color}
        startContent={state === "breached" ? <HiOutlineExclamation /> : null}
      >
        {cfg.label}
      </Chip>
    </Tooltip>
  );
}

/** Assignee name, or a muted "unassigned" marker. */
export function AssigneeChip({ name }) {
  if (!name) {
    return (
      <span className="text-xs text-default-400 flex items-center gap-1">
        <HiOutlineUser /> {t("unassigned")}
      </span>
    );
  }
  return (
    <span className="text-xs flex items-center gap-1 truncate">
      <HiOutlineUser className="text-default-400 shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
}
