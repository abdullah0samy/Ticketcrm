import React from "react";
import MyTable from "../ui/MyTable";
import { Button } from "@nextui-org/react";
import { FaWhatsapp } from "react-icons/fa";
import { t } from "i18next";

function AwaitSurveysTable() {
  return (
    <MyTable
      topContent={<h5 className="p-3 text-xl">{t("await surveys table")}</h5>}
      classNames={{ container: "max-h-[350px]" }}
    >
      <MyTable.Head>
        <MyTable.Col>{t("ID")}</MyTable.Col>
        <MyTable.Col>{t("patient")}</MyTable.Col>
        <MyTable.Col>{t("date")}</MyTable.Col>
        <MyTable.Col>{t("action")}</MyTable.Col>
      </MyTable.Head>
      <MyTable.Body>
        <MyTable.Row>
          <MyTable.Cell>150</MyTable.Cell>
          <MyTable.Cell>ahmed eldeep</MyTable.Cell>
          <MyTable.Cell>2-8-2023</MyTable.Cell>
          <MyTable.Cell>
          <Button isIconOnly size="sm">
              <FaWhatsapp />
            </Button>
          </MyTable.Cell>
        </MyTable.Row>
        <MyTable.Row>
          <MyTable.Cell>150</MyTable.Cell>
          <MyTable.Cell>ahmed eldeep</MyTable.Cell>
          <MyTable.Cell>2-8-2023</MyTable.Cell>
          <MyTable.Cell>
            <Button isIconOnly size="sm">
              <FaWhatsapp />
            </Button>
          </MyTable.Cell>
        </MyTable.Row>
        <MyTable.Row>
          <MyTable.Cell>150</MyTable.Cell>
          <MyTable.Cell>ahmed eldeep</MyTable.Cell>
          <MyTable.Cell>2-8-2023</MyTable.Cell>
          <MyTable.Cell>
            <Button isIconOnly size="sm">
              <FaWhatsapp />
            </Button>
          </MyTable.Cell>
        </MyTable.Row>
        <MyTable.Row>
          <MyTable.Cell>150</MyTable.Cell>
          <MyTable.Cell>ahmed eldeep</MyTable.Cell>
          <MyTable.Cell>2-8-2023</MyTable.Cell>
          <MyTable.Cell>
            <Button isIconOnly size="sm">
              <FaWhatsapp />
            </Button>
          </MyTable.Cell>
        </MyTable.Row>
        <MyTable.Row>
          <MyTable.Cell>150</MyTable.Cell>
          <MyTable.Cell>ahmed eldeep</MyTable.Cell>
          <MyTable.Cell>2-8-2023</MyTable.Cell>
          <MyTable.Cell>
            <Button isIconOnly size="sm">
              <FaWhatsapp />
            </Button>
          </MyTable.Cell>
        </MyTable.Row>
      </MyTable.Body>
    </MyTable>
  );
}

export default AwaitSurveysTable;
