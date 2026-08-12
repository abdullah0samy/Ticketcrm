import { Card, CardBody } from "@nextui-org/react";
import { t } from "i18next";
import React from "react";
import { useSelector } from "react-redux";
import { HiOutlinePlay } from "react-icons/hi";

export default function GuidePage() {
  const { userData } = useSelector((state) => state.account);

  // Receiving departments handle tickets; everyone else only raises them, so
  // each gets the walkthrough that matches what they actually do. Guarded
  // because a global admin has no department at all.
  const isReceiver = Boolean(userData?.department?.reciever);
  const video = isReceiver ? "/video/reciever.mp4" : "/video/sender.mp4";

  return (
    <div className="py-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("how to use the platform")}</h1>
          <p className="page-subtitle">
            {isReceiver ? t("handling incoming tickets") : t("raising a ticket")}
          </p>
        </div>
      </div>

      <Card radius="lg" shadow="sm">
        <CardBody className="p-3 sm:p-4">
          <video
            key={video}
            controls
            preload="metadata"
            className="w-full max-h-[70vh] rounded-lg bg-black"
          >
            <source src={video} type="video/mp4" />
            {t("your browser does not support video playback")}
          </video>

          <p className="flex items-center gap-2 text-sm text-default-500 mt-3">
            <HiOutlinePlay className="text-lg shrink-0" />
            {t("watch the walkthrough for your role")}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
