import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Chip, Progress, Select, SelectItem } from "@nextui-org/react";
import { t } from "i18next";
import moment from "moment";
import {
  HiOutlineTicket,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineUserAdd,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
} from "react-icons/hi";

import { getDashboardSummary } from "../../redux/actions/dashboardActions";
import HandleError from "../../components/common/HandleError";
import PieChart from "../../components/charts/PieChart";
import DonutChart from "../../components/charts/DonutChart";
import useParamsQuery from "../../hooks/useParamsQuery";

const PRIORITY_COLOR = {
  low: "default",
  normal: "primary",
  high: "warning",
  critical: "danger",
};

const STATUS_COLOR = {
  on_hold: "default",
  in_progress: "warning",
  complete: "primary",
  closed: "success",
};

function StatCard({ icon: Icon, label, value, tone = "text-primary", hint, to }) {
  const body = (
    // `!h-full` on purpose: NextUI's Card sets `h-auto` in its own base
    // classes, so a plain `h-full` loses and the tiles come out ragged.
    <Card
      radius="lg"
      shadow="sm"
      className="p-4 !h-full transition hover:shadow-md"
      isPressable={Boolean(to)}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-default-500 capitalize line-clamp-2">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{value ?? "—"}</p>
          {/* reserve the hint line either way so tiles in a row line up */}
          <p className="text-[11px] text-default-400 mt-0.5 min-h-[1rem]">{hint || ""}</p>
        </div>
        <span className={`shrink-0 text-2xl ${tone}`}>
          <Icon />
        </span>
      </div>
    </Card>
  );

  return to ? (
    <Link to={to} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { params, addParam } = useParamsQuery();
  const { data, isLoading, error } = useSelector((state) => state.dashboard);

  const {
    stats = {},
    priority_distribution: priorities = [],
    status_distribution: statuses = [],
    agent_performance: agents = [],
    department_load: departments = [],
    recent_activity: recent = [],
  } = data || {};

  useEffect(() => {
    dispatch(getDashboardSummary(params));
  }, [dispatch, params]);

  const days = params.days || "30";

  return (
    <div className="py-4">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("dashboard")}</h1>
          <p className="page-subtitle">
            {t("overview of today's activity")}
          </p>
        </div>
        <Select
          aria-label={t("period")}
          size="sm"
          className="w-full sm:w-44"
          selectedKeys={[String(days)]}
          onChange={(e) => addParam({ days: e.target.value })}
        >
          <SelectItem key="7">{t("last 7 days")}</SelectItem>
          <SelectItem key="30">{t("last 30 days")}</SelectItem>
          <SelectItem key="90">{t("last 90 days")}</SelectItem>
        </Select>
      </div>

      <HandleError isLoading={isLoading} error={error} isEmpty={false}>
        {/* KPI row */}
        <div className="grid grid-cols-2 items-stretch gap-3 mb-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon={HiOutlineTicket}
            label={t("total tickets")}
            value={stats.total}
            hint={`${stats.in_window ?? 0} ${t("in period")}`}
          />
          <StatCard
            icon={HiOutlineClock}
            label={t("open")}
            value={stats.open}
            tone="text-warning"
            to="/tickets/receive"
          />
          <StatCard
            icon={HiOutlineExclamation}
            label={t("overdue")}
            value={stats.overdue}
            tone="text-danger"
            hint={`${stats.due_soon ?? 0} ${t("due within 24h")}`}
            to="/tickets/receive?overdue=true"
          />
          <StatCard
            icon={HiOutlineUserAdd}
            label={t("unassigned")}
            value={stats.unassigned}
            tone="text-secondary"
            to="/tickets/receive?unassigned=true"
          />
          <StatCard
            icon={HiOutlineCheckCircle}
            label={t("SLA adherence")}
            value={stats.sla_adherence != null ? `${stats.sla_adherence}%` : "—"}
            tone="text-success"
            hint={`${stats.sla_met ?? 0} / ${(stats.sla_met ?? 0) + (stats.sla_breached ?? 0)}`}
          />
          <StatCard
            icon={HiOutlineLightningBolt}
            label={t("avg resolution")}
            value={
              stats.avg_resolution_hours != null
                ? `${stats.avg_resolution_hours}h`
                : "—"
            }
            tone="text-primary"
          />
        </div>

        {/* charts */}
        <div className="grid gap-3 mb-3 lg:grid-cols-2">
          <DonutChart
            title={t("tickets by priority")}
            labels={priorities.map((p) => t(p.priority))}
            series={priorities.map((p) => p.count)}
            onSelectData={() => {}}
          />
          <PieChart
            title={t("tickets by status")}
            labels={statuses.map((s) => t(s.status))}
            series={statuses.map((s) => s.count)}
            onSelectData={() => {}}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {/* agent workload */}
          <Card radius="sm" shadow="sm" className="p-4">
            <h2 className="font-semibold capitalize mb-3">
              {t("agent performance")}
            </h2>
            {agents.length ? (
              <div className="space-y-3">
                {agents.map((a) => (
                  <div key={a.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium truncate">{a.name}</span>
                      <span className="text-default-500 shrink-0">
                        {a.resolved}/{a.total}
                        {a.overdue ? (
                          <span className="text-danger ms-2">
                            {a.overdue} {t("overdue")}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <Progress
                      aria-label={a.name}
                      size="sm"
                      value={a.resolution_rate}
                      color={
                        a.resolution_rate >= 70
                          ? "success"
                          : a.resolution_rate >= 40
                          ? "warning"
                          : "danger"
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-default-400 py-6 text-center">
                {t("no data")}
              </p>
            )}
          </Card>

          {/* department load */}
          <Card radius="sm" shadow="sm" className="p-4">
            <h2 className="font-semibold capitalize mb-3">
              {t("department load")}
            </h2>
            {departments.length ? (
              <div className="space-y-2">
                {departments.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between border-b border-default-100 last:border-0 py-2"
                  >
                    <span className="text-sm font-medium truncate">{d.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Chip size="sm" variant="flat">
                        {d.open} {t("open")}
                      </Chip>
                      {d.overdue ? (
                        <Chip size="sm" color="danger" variant="flat">
                          {d.overdue} {t("overdue")}
                        </Chip>
                      ) : null}
                      <span className="text-xs text-default-400">
                        {t("total")}: {d.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-default-400 py-6 text-center">
                {t("no data")}
              </p>
            )}
          </Card>
        </div>

        {/* recent activity */}
        <Card radius="sm" shadow="sm" className="p-4 mt-3">
          <h2 className="font-semibold capitalize mb-3">
            {t("recent activity")}
          </h2>
          {recent.length ? (
            <div className="divide-y divide-default-100">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-2 py-2.5 text-sm"
                >
                  <span className="font-mono text-xs text-default-500 w-24 shrink-0">
                    {r.ticket_number}
                  </span>
                  <span className="flex-1 min-w-[12rem] truncate">
                    {r.description}
                  </span>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={PRIORITY_COLOR[r.priority] || "default"}
                  >
                    {t(r.priority)}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="dot"
                    color={STATUS_COLOR[r.status] || "default"}
                  >
                    {t(r.status)}
                  </Chip>
                  {r.is_overdue ? (
                    <Chip size="sm" color="danger">
                      {t("overdue")}
                    </Chip>
                  ) : null}
                  <span className="text-xs text-default-400 shrink-0">
                    {r.assigned_to || t("unassigned")} ·{" "}
                    {moment(r.created_at).fromNow()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-default-400 py-6 text-center">
              {t("no data")}
            </p>
          )}
        </Card>
      </HandleError>
    </div>
  );
}
