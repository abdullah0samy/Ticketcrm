import React from "react";
import MyTable from "../ui/MyTable";
import { t } from "i18next";
import { Button } from "@nextui-org/react";
import { Link } from "react-router-dom";

function UnsatisfiedTable({ rows = [] }) {
  return (
    <MyTable
      topContent={
        <h5 className="p-3 text-xl">{t("unsatisfied surveys table")}</h5>
      }
      bottomContent={
        <div className="flex justify-center py-2">
          <Button size="sm" as={Link} to={"/pr/view?satisfied=false"}>
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
        <MyTable.Col>{t("ID")}</MyTable.Col>
        <MyTable.Col>{t("medical number")}</MyTable.Col>
        <MyTable.Col>{t("doctor")}</MyTable.Col>
        <MyTable.Col>{t("patient")}</MyTable.Col>
      </MyTable.Head>
      <MyTable.Body>
        {rows.map((row) => {
          return (
            <MyTable.Row>
              <MyTable.Cell>
                <Link to={`/pr/view/${row.id}`}>{row.id}</Link>
              </MyTable.Cell>
              <MyTable.Cell>{row.medical_no}</MyTable.Cell>
              <MyTable.Cell>{row.doctor}</MyTable.Cell>
              <MyTable.Cell>{row.patient}</MyTable.Cell>
            </MyTable.Row>
          );
        })}
      </MyTable.Body>
    </MyTable>
  );
}

export default UnsatisfiedTable;
