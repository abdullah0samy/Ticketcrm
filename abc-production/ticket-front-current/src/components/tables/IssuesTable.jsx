import React from "react";
import {
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@nextui-org/react";
import { t } from "i18next";
import { useSelector } from "react-redux";
import { checkValue } from "./../../utils/helper";
import { status_color } from "./../../utils/data";

function IssuesTable({ ...restProps }) {
  const { isLoading, data, error } = useSelector(
    (state) => state.summary.ticket_statistic
  );

  const rows = data.results;

  const rowMapping = rows.map((row, index) => {
    const { id, complaint, description, status, building, floor, extension } = row;
    return (
      <TableRow key={id ?? index}>
        <TableCell>
          <User
            name={checkValue(complaint.name)}
            description={complaint.department}
            avatarProps={{
              classNames: { base: "shrink-0 hidden" },
            }}
            classNames={{
              name: "text-medium capitalize",
            }}
          ></User>
        </TableCell>
        <TableCell>{description}</TableCell>

        <TableCell>{t(building)}</TableCell>
        <TableCell>{t(floor)}</TableCell>
        <TableCell>{extension}</TableCell>
        <TableCell>
          <Chip variant="flat" color={status_color[status]}>
            {t(status)}
          </Chip>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <>
      {/* ------------------------------ phones and tablets: stacked cards */}
      <div className="lg:hidden flex flex-col gap-3">
        {rows.length === 0 ? (
          <Card radius="sm" shadow="sm" className="py-10 text-center text-default-400">
            {error || t("no data")}
          </Card>
        ) : (
          rows.map((row, index) => (
            <Card key={row.id ?? index} radius="lg" shadow="sm" className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm capitalize break-words">
                    {checkValue(row.complaint.name)}
                  </p>
                  <p className="text-xs text-default-400">{row.complaint.department}</p>
                </div>
                <Chip size="sm" variant="flat" color={status_color[row.status]}>
                  {t(row.status)}
                </Chip>
              </div>
              <p className="text-sm mb-2 break-words">{row.description}</p>
              <p className="text-xs text-default-500">
                {t(row.building)} · {t(row.floor)}
                {row.extension ? ` · ${t("extension")} ${row.extension}` : ""}
              </p>
            </Card>
          ))
        )}
      </div>

      <div className="hidden lg:block">
        <Table
          classNames={{ wrapper: "h-[40vh]" }}
          {...restProps}
          isLoading={isLoading}
        >
          <TableHeader>
            <TableColumn>{t("user")}</TableColumn>
            <TableColumn>{t("description")}</TableColumn>
            <TableColumn>{t("building")}</TableColumn>
            <TableColumn>{t("floor")}</TableColumn>
            <TableColumn>{t("extension")}</TableColumn>
            <TableColumn>{t("status")}</TableColumn>
          </TableHeader>
          <TableBody emptyContent={error}>{rowMapping}</TableBody>
        </Table>
      </div>
    </>
  );
}

export default IssuesTable;
