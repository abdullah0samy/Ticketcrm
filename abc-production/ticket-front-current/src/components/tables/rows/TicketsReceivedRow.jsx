import React from "react";
import { Button, Chip, Tooltip, User, useDisclosure } from "@nextui-org/react";
import {
  HiOutlineEye,
  HiOutlineInboxIn,
  HiOutlineArchive,
} from "react-icons/hi";
import moment from "moment/moment";
import { checkValue } from "../../../utils/helper";
import MyTable from "../../ui/MyTable";
import TicketDetailsModal from "./../../modals/TicketDetailsModal";
import { status_color } from "../../../utils/data";
import { t } from "i18next";
import IssueTypeModal from "../../modals/IssueTypeModal";
import CanView from "../../common/CanView";
import { PriorityChip, AssigneeChip, SlaChip } from "../../common/TicketBadges";

function TicketsReceivedRow({ ticketData, handleArchived, ...restProps }) {
  const {
    id,
    complaint,
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
  const details = useDisclosure();
  const issueType = useDisclosure();

  return (
    <>
      {details.isOpen ? (
        <TicketDetailsModal
          isOpen={details.isOpen}
          onClose={() => details.onOpenChange(false)}
          ticketId={id}
          isReciever
        />
      ) : null}
      {issueType.isOpen ? (
        <IssueTypeModal
          isOpen={issueType.isOpen}
          onClose={() => issueType.onOpenChange(false)}
          ticketId={id}
        />
      ) : null}

      <MyTable.Row rowId={id} {...restProps}>
        <MyTable.Cell>{id}</MyTable.Cell>
        <MyTable.Cell>
          <User
            name={complaint.name}
            description={complaint.department}
            avatarProps={{
              classNames: { base: "shrink-0	 hidden" },
            }}
            classNames={{
              name: "text-base capitalize",
              description: "text-small",
            }}
          />
        </MyTable.Cell>
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
        <MyTable.Cell>{moment(created_at).format("l LT")}</MyTable.Cell>
        <MyTable.Cell>{checkValue(issuetype?.name)}</MyTable.Cell>
        <MyTable.Cell>
          <div className="flex items-center justify-center gap-1">
            <Tooltip key="view" color="foreground" content={t("view details")}>
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                color="primary"
                onClick={details.onOpen}
              >
                <HiOutlineEye className="text-lg" />
              </Button>
            </Tooltip>
            <CanView allowed={["manager"]}>
              <Tooltip
                key="issueType"
                color="foreground"
                content={t("issue type")}
              >
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={issueType.onOpen}
                >
                  <HiOutlineInboxIn className="text-lg" />
                </Button>
              </Tooltip>
              <Tooltip key="archive" color="foreground" content={t("archive")}>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  color="danger"
                  onClick={() => handleArchived([id])}
                >
                  <HiOutlineArchive className="text-lg" />
                </Button>
              </Tooltip>
            </CanView>
          </div>
        </MyTable.Cell>
      </MyTable.Row>
    </>
  );
}

export default TicketsReceivedRow;
