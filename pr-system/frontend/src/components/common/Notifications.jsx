import React from "react";
import { Button, Badge } from "@nextui-org/react";
import { HiOutlineBell } from "react-icons/hi";
import { t } from "i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  getMoreNotifications,
  getNotifications,
} from "../../redux/actions/notificationActions";
import HandleError from "./HandleError";
import moment from "moment";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/Popover";
import LoadMoreData from "./LoadMoreData";

export default function Notifications() {
  const dispatch = useDispatch();
  const {
    data: { results, next },
    isLoading,
    error,
  } = useSelector((state) => state.notifications);

  const { userData } = useSelector((state) => state.account);

  const notificationMapping = results.map((item) => {
    return <NotificationItem key={item.id} notificationData={item} />;
  });

  return (
    <Popover
      placement="bottom"
      size="md"
      onOpenChange={(open) => (open ? dispatch(getNotifications()) : null)}
    >
      <Badge content={userData.notifications_count} size="md" color="danger">
        <PopoverTrigger>
          <Button size="md" variant="flat" isIconOnly radius="full">
            <HiOutlineBell className="text-xl" />
          </Button>
        </PopoverTrigger>
      </Badge>
      <PopoverContent className=" min-w-[420px] max-w-[420px]">
        <div>
          <div className="text-lg font-bold capitalize mb-2">
            {t("notifications")}
          </div>
          <HandleError
            isLoading={isLoading}
            error={error}
            isEmpty={!results.length}
          >
            <ul className="flex flex-col  divide-y-1 max-h-96 overflow-auto">
              {notificationMapping}
              <LoadMoreData
                next={next}
                dispatchFn={() => getMoreNotifications(next)}
                btnProps={{
                  size: "sm",
                }}
              />
            </ul>
          </HandleError>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notificationData }) {
  const { message, created_at } = notificationData;
  return (
    <li className="px-2.5 py-1.5 hover:bg-gray-100">
      <p className="text-base mb-1">{message}</p>
      <span>- {moment(created_at).format("l LT")}</span>
    </li>
  );
}
