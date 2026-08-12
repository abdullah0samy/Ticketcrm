import React from "react";
import MyTable from "../../ui/MyTable";
import { Button, Chip, Tooltip, User } from "@nextui-org/react";
import { HiOutlineRefresh } from "react-icons/hi";
import { status_color } from "../../../utils/data";
import moment from "moment";
import { t } from "i18next";

function ArchivedTicketsRow({ ticketData, handleRestore, ...restProps }) {
  const {
    id,
    complaint,
    department,
    building,
    floor,
    status,
    created_at,
    extension,
  } = ticketData;

  return (
    <MyTable.Row {...restProps}>
      <MyTable.Cell>{id}</MyTable.Cell>
      <MyTable.Cell>
        <User
          name={complaint.name}
          description={complaint.department}
          avatarProps={{
            classNames: { base: "shrink-0	 hidden" },
          }}
          classNames={{
            name: "text-medium capitalize",
          }}
        ></User>
      </MyTable.Cell>
      <MyTable.Cell>{department.name}</MyTable.Cell>
      <MyTable.Cell>{t(building)}</MyTable.Cell>
      <MyTable.Cell>{t(floor)}</MyTable.Cell>
      <MyTable.Cell>{extension}</MyTable.Cell>
      <MyTable.Cell>
        <Chip color={status_color[status]} variant="flat" size="sm">
          {t(status)}
        </Chip>
      </MyTable.Cell>
      <MyTable.Cell>{moment(created_at).format("l LT")}</MyTable.Cell>
      <MyTable.Cell>
        <Tooltip key="restore" color="foreground" content={t("restore")}>
          <Button
            isIconOnly
            variant="flat"
            color="success"
            onClick={() => handleRestore([id])}
          >
            <HiOutlineRefresh className="text-xl" />
          </Button>
        </Tooltip>
      </MyTable.Cell>
    </MyTable.Row>
  );
}

export default ArchivedTicketsRow;
