import { Button, Card, CardBody, CardFooter, Tooltip } from "@nextui-org/react";
import { t } from "i18next";
import moment from "moment";
import React from "react";
import { HiOutlineFolderDownload } from "react-icons/hi";

export default function FileCard({ fileData }) {
  const { title, created_at, files } = fileData;
  return (
    <Card className="hover:bg-green-100" radius="sm" shadow="sm">
      <CardBody>
        <div className="text-center">
          <img className="w-20 my-2 m-auto" src="/image/xls.png" alt="xls sheet" />
          <h5 className="text-lg line-clamp-1	">{title}</h5>
        </div>
      </CardBody>
      <CardFooter className="flex items-center justify-between pt-0">
        <p className="text-sm text-default-500">{moment(created_at).format("l LT")}</p>
        <Tooltip
          color="foreground"
          className="capitalize"
          content={t("download")}
          showArrow
        >
          <Button
            variant="light"
            isIconOnly
            radius="full"
            as={"a"}
            href={files}
          >
            <HiOutlineFolderDownload className="text-xl" />
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
