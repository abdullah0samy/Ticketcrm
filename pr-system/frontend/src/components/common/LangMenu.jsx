"use client";

import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Button,
} from "@nextui-org/react";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { HiOutlineTranslate } from "react-icons/hi";

export default function LangMenu() {
  const { i18n } = useTranslation();
  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
  };
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button size="md" variant="flat" isIconOnly radius="full">
          <HiOutlineTranslate className="text-lg" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectedKeys={[i18n.language]}
        selectionMode="single"
        variant="flat"
      >
        <DropdownItem
          key="ar"
          startContent={<img src="/image/eg.png" alt="eg icon" className="w-6" />}
          onClick={() => changeLang("ar")}
          className="capitalize"
        >
          {t("arabic")}
        </DropdownItem>
        <DropdownItem
          key="en"
          startContent={<img src="/image/us.png" alt="us icon" className="w-6" />}
          onClick={() => changeLang("en")}
          className="capitalize"
        >
          {t("english")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
