import React from "react";
import MyTable from "../ui/MyTable";
import { t } from "i18next";
import { Button, Chip, Tooltip } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { HiOutlineFaceFrown } from "react-icons/hi2";

function UnsatisfiedTable({ rows = [] }) {
  return (
    <MyTable
      topContent={
        <div className="flex flex-wrap items-center justify-between gap-2 p-3">
          <h5 className="flex items-center gap-2 text-lg font-semibold capitalize sm:text-xl">
            <HiOutlineFaceFrown className="text-2xl text-danger" />
            {t("unsatisfied surveys table")}
          </h5>
          {rows.length > 0 && (
            <Chip color="danger" variant="flat" size="sm">
              {rows.length}
            </Chip>
          )}
        </div>
      }
      bottomContent={
        <div className="flex justify-center py-2">
          {/* The app is served at the root now; `/pr/view/...` has no route and
              fell through to the catch-all, bouncing the user back home. */}
          <Button size="sm" as={Link} to="/view?satisfied=false" variant="flat">
            {t("view more")}
          </Button>
        </div>
      }
      classNames={{
        container: "h-full",
        card: "h-full",
      }}
    >
      <MyTable.Head>
        <MyTable.Col>{t("id")}</MyTable.Col>
        <MyTable.Col>{t("medical number")}</MyTable.Col>
        <MyTable.Col>{t("doctor")}</MyTable.Col>
        <MyTable.Col>{t("patient")}</MyTable.Col>
        <MyTable.Col>{t("comment")}</MyTable.Col>
      </MyTable.Head>
      <MyTable.Body>
        {rows.map((row) => (
          <MyTable.Row key={row.id}>
            <MyTable.Cell>
              <Link
                to={`/view/${row.id}`}
                className="font-medium text-primary hover:underline"
              >
                #{row.id}
              </Link>
            </MyTable.Cell>
            <MyTable.Cell>{row.medical_no || "—"}</MyTable.Cell>
            <MyTable.Cell>{row.doctor || "—"}</MyTable.Cell>
            <MyTable.Cell>{row.patient || "—"}</MyTable.Cell>
            <MyTable.Cell>
              {row.comment ? (
                <Tooltip content={row.comment} className="max-w-xs">
                  <span className="line-clamp-1 block max-w-[16rem] text-default-600">
                    {row.comment}
                  </span>
                </Tooltip>
              ) : (
                "—"
              )}
            </MyTable.Cell>
          </MyTable.Row>
        ))}
      </MyTable.Body>
    </MyTable>
  );
}

export default UnsatisfiedTable;
