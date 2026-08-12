import React, { useMemo } from "react";
import { Chip } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { t } from "i18next";
import { checkValue, getFullName, cn } from "../../utils/helper";
import { status_color } from "./../../utils/data";
import moment from "moment";
import HandleError from "../common/HandleError";
import {
  HiOutlineArrowLongRight,
  HiOutlineClock,
  HiOutlineUser,
} from "react-icons/hi2";

/**
 * Ticket history as a timeline.
 *
 * The table listed five columns of mostly identical values and left the reader
 * to diff consecutive rows by eye. Entries are ordered newest-first from the
 * API, so each one is compared against the entry *after* it — the previous
 * state — and only the fields that actually moved are rendered.
 */
function TicketHistory() {
  const {
    data: { results },
    isLoading,
    error,
  } = useSelector((state) => state.ticketProfile.history);

  const entries = useMemo(
    () =>
      results.map((row, index) => {
        const previous = results[index + 1];
        const changes = [];
        if (previous) {
          if (previous.status !== row.status) {
            changes.push({
              key: "status",
              label: t("status"),
              from: previous.status,
              to: row.status,
              isStatus: true,
            });
          }
          if (previous.department?.name !== row.department?.name) {
            changes.push({
              key: "department",
              label: t("department"),
              from: previous.department?.name,
              to: row.department?.name,
            });
          }
          if (previous.issuetype?.name !== row.issuetype?.name) {
            changes.push({
              key: "issuetype",
              label: t("issue type"),
              from: previous.issuetype?.name,
              to: row.issuetype?.name,
            });
          }
        }
        return { row, changes, isCreation: !previous };
      }),
    [results]
  );

  return (
    <div className="p-3 sm:p-4">
      <HandleError isLoading={isLoading} error={error} isEmpty={!results.length}>
        <ol className="relative space-y-4 ps-6">
          {/* The rail. Inset matches the dot so they line up at any font size. */}
          <span className="absolute bottom-2 start-[7px] top-2 w-px bg-default-200" />
          {entries.map(({ row, changes, isCreation }) => (
            <li key={row.history_id} className="relative">
              <span
                className={cn(
                  "absolute -start-6 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-white shadow",
                  isCreation ? "bg-success" : "bg-primary"
                )}
              />
              <div className="rounded-lg border border-default-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={status_color[row.status]}
                    className="capitalize"
                  >
                    {t(row.status)}
                  </Chip>
                  <span className="flex items-center gap-1 text-tiny text-default-500">
                    <HiOutlineUser className="text-sm" />
                    {getFullName(row.history_user)}
                  </span>
                  <span className="ms-auto flex items-center gap-1 text-tiny text-default-400">
                    <HiOutlineClock className="text-sm" />
                    {moment(row.history_date).format("l LT")}
                  </span>
                </div>

                {isCreation ? (
                  <p className="mt-2 text-small text-default-600">
                    {t("ticket created")} ·{" "}
                    {checkValue(row.department?.name)} ·{" "}
                    {checkValue(row.issuetype?.name)}
                  </p>
                ) : changes.length ? (
                  <ul className="mt-2 space-y-1">
                    {changes.map((change) => (
                      <li
                        key={change.key}
                        className="flex flex-wrap items-center gap-1.5 text-small"
                      >
                        <span className="text-default-500">{change.label}:</span>
                        <span className="text-default-400 line-through">
                          {change.isStatus
                            ? t(change.from)
                            : checkValue(change.from)}
                        </span>
                        <HiOutlineArrowLongRight className="text-default-400 rtl:rotate-180" />
                        <span className="font-medium text-default-800">
                          {change.isStatus ? t(change.to) : checkValue(change.to)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-small text-default-400">
                    {t("no visible changes")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </HandleError>
    </div>
  );
}

export default TicketHistory;
