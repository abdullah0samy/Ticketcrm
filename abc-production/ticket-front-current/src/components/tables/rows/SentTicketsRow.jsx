import React from "react";
import MyTable from "../../ui/MyTable";
import { Button, Chip, Tooltip, useDisclosure } from "@nextui-org/react";
import { HiOutlineEye, HiOutlineLockOpen } from "react-icons/hi";
import { checkValue } from "./../../../utils/helper";
import moment from "moment";
import TicketDetailsModal from "../../modals/TicketDetailsModal";
import { status_color } from "../../../utils/data";
import { t } from "i18next";
import { PriorityChip, AssigneeChip, SlaChip } from "../../common/TicketBadges";
import { useDispatch } from "react-redux";
import { closeTicket } from "../../../redux/actions/ticketActions";
import { toast } from "sonner";

export default function SentTicketsRow({ ticketData, ...restProps }) {
  const {
    id,
    department,
    issuetype,
    building,
    floor,
    status,
    priority,
    assigned_to_name,
    sla_state,
    sla_deadline,
    created_at,
    extension,
  } = ticketData;
  const { onOpen, onOpenChange, isOpen } = useDisclosure();
  const dispatch = useDispatch();

  const handleCloseTicket = async () => {
    try {
      await dispatch(closeTicket(id)).unwrap();
      toast.success(t("closed ticket success"));
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      {isOpen ? (
        <TicketDetailsModal
          isOpen={isOpen}
          onClose={() => onOpenChange(false)}
          ticketId={id}
          me={true}
        />
      ) : null}
      <MyTable.Row {...restProps}>
        <MyTable.Cell>{id}</MyTable.Cell>
        <MyTable.Cell>{department.name}</MyTable.Cell>
        <MyTable.Cell>{t(building)}</MyTable.Cell>
        <MyTable.Cell>{t(floor)}</MyTable.Cell>
        <MyTable.Cell>{extension}</MyTable.Cell>
        <MyTable.Cell>
          <PriorityChip priority={priority} />
        </MyTable.Cell>
        <MyTable.Cell>
          <AssigneeChip name={assigned_to_name} />
        </MyTable.Cell>
        <MyTable.Cell>
          <SlaChip state={sla_state} deadline={sla_deadline} />
        </MyTable.Cell>
        <MyTable.Cell>
          <Chip color={status_color[status]} variant="flat" size="sm">
            {t(status)}
          </Chip>
        </MyTable.Cell>
        <MyTable.Cell>{checkValue(issuetype?.name)}</MyTable.Cell>
        <MyTable.Cell>{moment(created_at).format("l LT")}</MyTable.Cell>
        <MyTable.Cell>
          <div className="flex items-center justify-center gap-2">
            <Tooltip key="view" color="foreground" content={t("view details")}>
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                color="primary"
                onClick={onOpen}
              >
                <HiOutlineEye className="text-lg" />
              </Button>
            </Tooltip>
            {status === "complete" ? (
              <Tooltip key="close" color="foreground" content={t("close")}>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  color="success"
                  onClick={() => handleCloseTicket(id)}
                >
                  <HiOutlineLockOpen className="text-lg" />
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </MyTable.Cell>
      </MyTable.Row>
    </>
  );
}
