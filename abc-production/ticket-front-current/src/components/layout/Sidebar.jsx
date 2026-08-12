import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@nextui-org/react";
import { t } from "i18next";
import { useSelector } from "react-redux";
import CanView from "../common/CanView";
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineHome,
  HiOutlineDocumentDownload,
  HiOutlineChartSquareBar,
  HiOutlineViewGridAdd,
  HiOutlineQuestionMarkCircle,
  HiOutlineSaveAs,
  HiOutlineClipboardList,
  HiOutlineArchive,
  HiOutlineTemplate,
  HiOutlineSwitchHorizontal,
  HiOutlineBookOpen,
  HiOutlineOfficeBuilding,
  HiOutlineViewBoards,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiOutlineUserCircle,
} from "react-icons/hi";

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <li className="nav-item" onClick={onClick}>
      <NavLink to={to} className="nav-link">
        <Icon className="text-xl" />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

function SectionLabel({ children }) {
  return (
    <li className="px-4 pt-4 pb-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-default-400">
        {children}
      </span>
    </li>
  );
}

export default function Sidebar({ isActive, closeSidebar }) {
  const {
    userData: { department, role },
  } = useSelector((state) => state.account);

  const isAdmin = role === "administration";
  const receives = Boolean(department?.reciever);

  return (
    <div className={`sidebar ${isActive ? "active" : ""}`}>
      {/* close button (mobile) */}
      <div className="flex md:hidden p-3">
        <Button
          variant="flat"
          fullWidth
          startContent={<HiOutlineChevronDoubleLeft className="rtl:rotate-180" />}
          onClick={closeSidebar}
        >
          {t("close")}
        </Button>
      </div>

      {/* logo */}
      <div className="box-center p-6 capitalize">
        <img className="w-28" src="/image/brand.png" alt="logo" />
      </div>

      <ul className="nav">
        <NavItem to="/dashboard" icon={HiOutlineTemplate} label={t("dashboard")} onClick={closeSidebar} />
        <NavItem to="/tickets/add" icon={HiOutlineViewGridAdd} label={t("add ticket")} onClick={closeSidebar} />

        {receives ? (
          <CanView allowed={["manager", "agent"]}>
            <NavItem to="/tickets/receive" icon={HiOutlineSaveAs} label={t("receive tickets")} onClick={closeSidebar} />
          </CanView>
        ) : null}

        <NavItem to="/tickets/sent" icon={HiOutlineClipboardList} label={t("sent tickets")} onClick={closeSidebar} />
        <NavItem to="/tickets/transferred" icon={HiOutlineSwitchHorizontal} label={t("transferred tickets")} onClick={closeSidebar} />

        {receives ? (
          <CanView allowed={["manager"]}>
            <NavItem to="/tickets/archive" icon={HiOutlineArchive} label={t("archive tickets")} onClick={closeSidebar} />
          </CanView>
        ) : null}

        {isAdmin || (role === "manager" && receives) ? (
          <>
            <NavItem to="/statistics" icon={HiOutlineChartSquareBar} label={t("statistics")} onClick={closeSidebar} />
            <NavItem to="/exports" icon={HiOutlineDocumentDownload} label={t("exports")} onClick={closeSidebar} />
          </>
        ) : null}

        {receives ? (
          <CanView allowed={["manager", "agent"]}>
            <NavItem to="/" icon={HiOutlineHome} label={t("team feed")} onClick={closeSidebar} />
          </CanView>
        ) : null}

        <NavItem to="/knowledge" icon={HiOutlineBookOpen} label={t("knowledge base")} onClick={closeSidebar} />
        <NavItem to="/settings" icon={HiOutlineUserCircle} label={t("profile")} onClick={closeSidebar} />
        <NavItem to="/guide" icon={HiOutlineQuestionMarkCircle} label={t("guide")} onClick={closeSidebar} />

        {/* ---------------- administration ---------------- */}
        <CanView allowed={["administration", "manager"]}>
          <SectionLabel>{t("administration")}</SectionLabel>
          <NavItem to="/admin/assets" icon={HiOutlineCube} label={t("assets")} onClick={closeSidebar} />
        </CanView>

        <CanView allowed={["administration"]}>
          <NavItem to="/admin/buildings" icon={HiOutlineOfficeBuilding} label={t("buildings")} onClick={closeSidebar} />
          <NavItem to="/admin/floors" icon={HiOutlineViewBoards} label={t("floors")} onClick={closeSidebar} />
          <NavItem to="/admin/departments" icon={HiOutlineUserGroup} label={t("departments")} onClick={closeSidebar} />
          <NavItem to="/admin/ticket-types" icon={HiOutlineTag} label={t("ticket types")} onClick={closeSidebar} />
          <NavItem to="/admin/users" icon={HiOutlineUsers} label={t("user management")} onClick={closeSidebar} />
          <NavItem to="/admin/roles" icon={HiOutlineKey} label={t("roles")} onClick={closeSidebar} />
          <NavItem to="/admin/audit" icon={HiOutlineShieldCheck} label={t("audit logs")} onClick={closeSidebar} />
        </CanView>
      </ul>
    </div>
  );
}
