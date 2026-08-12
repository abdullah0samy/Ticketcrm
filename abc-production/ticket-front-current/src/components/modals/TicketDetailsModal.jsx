import React, { useContext, useEffect, useState } from "react";
import { Divider, Tabs, Tab, Chip, Button, Tooltip } from "@nextui-org/react";
import {
  HiOutlineInformationCircle,
  HiOutlinePaperClip,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineXMark,
  HiOutlineClipboardDocument,
} from "react-icons/hi2";
import TicketDetails from "../common/TicketDetails";
import ChatApp from "../common/ChatApp";
import TicketHistory from "../tables/TicketHistory";
import Dialog from "../common/Dialog";
import { t } from "i18next";
import { useDispatch, useSelector } from "react-redux";
import { getTicketById } from "../../redux/actions/ticketActions";
import HandleError from "../common/HandleError";
import TicketAttach from "../common/TicketAttach";
import { webSocketContext } from "../../socket-context";
import { status_color } from "../../utils/data";
import { toast } from "sonner";

export default function TicketDetailsModal({
  isOpen,
  onClose,
  me,
  ticketId,
  isReciever,
}) {
  const [selected, setSelected] = useState("details");
  const dispatch = useDispatch();
  const details = useSelector((state) => state.ticketProfile.details);
  // The context defaults to null, so destructuring it directly throws whenever
  // the modal renders outside the provider.
  const { sendSocket } = useContext(webSocketContext) ?? {};

  const ticket = details.results ?? {};
  const attachmentsCount = ticket.images?.length ?? 0;

  useEffect(() => {
    dispatch(getTicketById({ ticketId, params: { me } }));
  }, [dispatch, ticketId, me]);

  // Reopening the modal on a different ticket kept whichever tab was last
  // open, which meant landing in someone else's chat instead of the details.
  useEffect(() => {
    setSelected("details");
  }, [ticketId]);

  const onSelectionChange = (selectedKey) => {
    // The join/leave messages used to be sent from inside the setSelected
    // updater. A state updater must be pure — React may call it more than once
    // — and worse, if the socket had already closed, `sendSocket` threw from
    // inside the update and took the whole dialog down with it. Leaving the
    // chat tab is exactly when that happens, so switching to History unmounted
    // the modal instead of showing the history.
    try {
      if (selected === "chat" && selectedKey !== "chat") {
        sendSocket({
          action: "leave_ticket",
          request_id: Math.random(),
          pk: ticketId,
        });
      }
      if (selectedKey === "chat") {
        sendSocket({
          action: "join_ticket",
          request_id: Math.random(),
          pk: ticketId,
        });
      }
    } catch {
      // A dropped socket only costs live updates; the tab must still open.
    }
    setSelected(selectedKey);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(ticketId));
      toast.success(t("copied"));
    } catch {
      toast.error(t("copy failed"));
    }
  };

  const tabTitle = (icon, label, count) => (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="hidden capitalize sm:inline">{label}</span>
      {count > 0 && (
        <span className="rounded-full bg-default-200 px-1.5 text-tiny leading-5 text-default-700">
          {count}
        </span>
      )}
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="4xl"
      radius="lg"
      className="h-[92vh] sm:h-[80vh]"
    >
      <Dialog.Header className="flex-col items-stretch gap-3 border-b bg-default-50 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">
                {t("tickets id")} #{ticketId}
              </h3>
              <Tooltip content={t("copy id")}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  onPress={copyId}
                  aria-label={t("copy id")}
                >
                  <HiOutlineClipboardDocument className="text-base text-default-500" />
                </Button>
              </Tooltip>
              {ticket.status && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={status_color[ticket.status]}
                  className="capitalize"
                >
                  {t(ticket.status)}
                </Chip>
              )}
            </div>
            <p className="mt-0.5 line-clamp-1 text-small text-default-500">
              {[ticket.department?.name, ticket.issuetype?.name]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            onPress={onClose}
            aria-label={t("close")}
          >
            <HiOutlineXMark className="text-xl" />
          </Button>
        </div>

        <Tabs
          aria-label={t("details")}
          color="primary"
          variant="underlined"
          selectedKey={selected}
          onSelectionChange={onSelectionChange}
          classNames={{
            base: "w-full",
            tabList: "w-full gap-2 sm:gap-6 p-0 overflow-x-auto",
            cursor: "w-full",
            tab: "max-w-fit px-2 h-11",
          }}
        >
          <Tab
            key="details"
            title={tabTitle(
              <HiOutlineInformationCircle className="text-lg" />,
              t("details")
            )}
          />
          <Tab
            key="attachments"
            title={tabTitle(
              <HiOutlinePaperClip className="text-lg" />,
              t("attachments"),
              attachmentsCount
            )}
          />
          <Tab
            key="chat"
            title={tabTitle(
              <HiOutlineChatBubbleLeftRight className="text-lg" />,
              t("chat")
            )}
          />
          <Tab
            key="history"
            title={tabTitle(<HiOutlineClock className="text-lg" />, t("history"))}
          />
        </Tabs>
      </Dialog.Header>
      <Divider />
      {/* min-h-0 is what lets the chat's own scroller work: without it a flex
          child refuses to shrink below its content and the composer is pushed
          off the bottom of the dialog. */}
      <Dialog.Body
        className={
          selected === "chat"
            ? "min-h-0 flex-1 overflow-hidden p-0"
            : "min-h-0 flex-1 overflow-auto px-0 py-0"
        }
      >
        {selected === "details" ? (
          <HandleError
            isLoading={details.isLoading}
            error={details.error}
            isEmpty={false}
          >
            <TicketDetails ticketData={ticket} isReciever={isReciever} />
          </HandleError>
        ) : null}
        {selected === "attachments" ? (
          <TicketAttach images={ticket.images} />
        ) : null}
        {selected === "chat" ? <ChatApp ticketId={ticketId} /> : null}
        {selected === "history" ? <TicketHistory /> : null}
      </Dialog.Body>
    </Dialog>
  );
}
