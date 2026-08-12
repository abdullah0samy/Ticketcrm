import React from "react";
import { Switch, Chip, Card, CardBody } from "@nextui-org/react";
import {
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineBuildingOffice,
  HiOutlineArrowsUpDown,
  HiOutlinePhone,
  HiOutlineHashtag,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import { t } from "i18next";
import moment from "moment/moment";
import { checkValue, cn } from "../../utils/helper";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { updateTicket } from "../../redux/actions/ticketActions";

/** One labelled fact. Stacks on a phone, sits in a grid on a wide screen. */
function Fact({ icon, label, value, className }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-default-200 bg-white p-3",
        className
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-tiny uppercase tracking-wide text-default-400">
          {label}
        </p>
        <p className="break-words text-small font-medium text-default-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function TicketDetails({ ticketData, isReciever }) {
  const {
    id,
    complaint,
    floor,
    building,
    department,
    phone,
    extension,
    created_at,
    description,
    comment,
    issuetype,
    status,
    is_external,
    note,
  } = ticketData;

  const dispatch = useDispatch();

  const changeStatus = async () => {
    try {
      const payload = {
        ticketId: id,
        data: { status: "in_progress" },
      };
      await dispatch(updateTicket(payload)).unwrap();
      toast.success(t("success change status"));
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {isReciever ? (
        <Card shadow="none" className="border border-warning-200 bg-warning-50">
          <CardBody className="flex flex-row items-center justify-between gap-3 py-3">
            <div>
              <p className="text-small font-medium capitalize">
                {t("start working on this ticket")}
              </p>
              <p className="text-tiny text-default-500">
                {status === "on_hold"
                  ? t("ticket is waiting to be picked up")
                  : t("already picked up")}
              </p>
            </div>
            <Switch
              onValueChange={changeStatus}
              isDisabled={status !== "on_hold"}
              defaultSelected={status !== "on_hold"}
              color="warning"
              size="sm"
              aria-label={t("in_progress")}
            />
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <Fact
          icon={<HiOutlineUser className="text-lg" />}
          label={t("user")}
          value={checkValue(complaint?.name)}
        />
        <Fact
          icon={<HiOutlineBuildingOffice2 className="text-lg" />}
          label={t("department")}
          value={checkValue(department?.name)}
        />
        <Fact
          icon={<HiOutlineTag className="text-lg" />}
          label={t("issue type")}
          value={checkValue(issuetype?.name)}
        />
        <Fact
          icon={<HiOutlineBuildingOffice className="text-lg" />}
          label={t("building")}
          value={building ? t(building) : t("unknown")}
        />
        <Fact
          icon={<HiOutlineArrowsUpDown className="text-lg" />}
          label={t("floor")}
          value={floor ? t(floor) : t("unknown")}
        />
        <Fact
          icon={<HiOutlinePhone className="text-lg" />}
          label={t("phone")}
          value={
            phone ? `${phone.country_code}${phone.phone}` : t("unknown")
          }
        />
        <Fact
          icon={<HiOutlineHashtag className="text-lg" />}
          label={t("extension")}
          value={checkValue(extension)}
        />
        <Fact
          icon={<HiOutlineCalendarDays className="text-lg" />}
          label={t("date")}
          value={created_at ? moment(created_at).format("l LT") : t("unknown")}
        />
        <Fact
          icon={<HiOutlineChatBubbleBottomCenterText className="text-lg" />}
          label={t("talks")}
          value={checkValue(comment)}
        />
      </div>

      <div className="rounded-lg border border-default-200 bg-default-50 p-3">
        <h6 className="mb-1.5 flex items-center gap-2 text-small font-semibold capitalize text-default-700">
          <HiOutlineDocumentText className="text-lg text-primary" />
          {t("description")}
        </h6>
        <p className="whitespace-pre-wrap break-words text-small leading-relaxed text-default-700">
          {description || t("unknown")}
        </p>
      </div>

      {status === "complete" && (
        <div className="rounded-lg border border-success-200 bg-success-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-small font-medium">
              <HiOutlineCheckBadge className="text-lg text-success" />
              {t("Resolved by external resource")}
            </span>
            <Chip
              size="sm"
              variant="flat"
              color={is_external ? "success" : "default"}
            >
              {is_external ? t("yes") : t("no")}
            </Chip>
          </div>
          {is_external && (
            <div className="mt-2">
              <p className="text-tiny uppercase tracking-wide text-default-400">
                {t("note")}
              </p>
              <p className="whitespace-pre-wrap break-words text-small text-default-700">
                {note || t("unknown")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketDetails;
