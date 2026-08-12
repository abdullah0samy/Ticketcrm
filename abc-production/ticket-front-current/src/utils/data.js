import {
  HiOutlineHome,
  HiOutlineDocumentDownload,
  HiOutlineChartSquareBar,
  HiOutlineViewGridAdd,
  HiOutlineQuestionMarkCircle,
  HiOutlineSaveAs,
  HiOutlineClipboardList,
  HiOutlineArchive,
} from "react-icons/hi";

export const nav_links = [
  {
    name: "home",
    to: "/",
    icon: <HiOutlineHome className="text-xl" />,
    role: ["manager", "agent"],
    isReciever: true,
  },
  {
    name: "statistics",
    to: "/statistics",
    icon: <HiOutlineChartSquareBar className="text-xl" />,
    role: ["manager", "administration"],
    isReciever: true,
  },
  {
    name: "exports",
    to: "/exports",
    icon: <HiOutlineDocumentDownload className="text-xl" />,
    role: ["manager", "administration"],
    isReciever: true,
  },
  {
    name: "archive tickets",
    to: "/tickets/archive",
    icon: <HiOutlineArchive className="text-xl" />,
    role: ["manager"],
    isReciever: true,
  },
  {
    name: "sent tickets",
    to: "/tickets/sent",
    icon: <HiOutlineClipboardList className="text-xl" />,
    role: ["all"],
  },
  {
    name: "receive tickets",
    to: "/tickets/receive",
    icon: <HiOutlineSaveAs className="text-xl" />,
    role: ["manager", "agent"],
    isReciever: true,
  },
  {
    name: "add ticket",
    to: "/tickets/add",
    icon: <HiOutlineViewGridAdd className="text-xl" />,
    role: ["all"],
  },
  {
    name: "guide",
    to: "/guide",
    icon: <HiOutlineQuestionMarkCircle className="text-xl" />,
    role: ["all"],
  },
];

export const received_columns = [
  { key: "id", label: "#" },
  { key: "user", label: "user", className: "w-40" },
  { key: "building", label: "building", className: "w-[100px]" },
  { key: "floor", label: "floor", className: "w-[100px]" },
  { key: "extension", label: "extension" },
  { key: "priority", label: "priority" },
  { key: "assignee", label: "assignee", className: "w-32" },
  { key: "sla", label: "SLA" },
  { key: "status", label: "status" },
  { key: "date", label: "date", className: "w-24" },
  { key: "issus_type", label: "issue type", className: "w-[100px]" },
  { key: "action", label: "action" },
];

export const sent_columns = [
  { key: "id", label: "#" },
  { key: "department", label: "department", className: "w-[80px]" },
  { key: "building", label: "building", className: "w-[100px]" },
  { key: "floor", label: "floor", className: "w-[100px]" },
  { key: "extension", label: "extension" },
  { key: "priority", label: "priority" },
  { key: "assignee", label: "assignee", className: "w-32" },
  { key: "sla", label: "SLA" },
  { key: "status", label: "status" },
  { key: "issus_type", label: "issue type" },
  { key: "date", label: "date", className: "w-24" },
  { key: "action", label: "action" },
];

export const archived_columns = [
  { key: "id", label: "#" },
  { key: "user", label: "user", className: "min-w-[110px]" },
  { key: "department", label: "department", className: "min-w-[85px]" },
  { key: "building", label: "building", className: "w-[100px]" },
  { key: "floor", label: "floor", className: "w-[100px]" },
  { key: "extension", label: "extension" },
  { key: "status", label: "status" },
  { key: "date", label: "date", className: "w-24" },
  { key: "restore", label: "restore" },
];

export const status_color = {
  in_progress: "warning",
  complete: "primary",
  on_hold: "danger",
  closed: "success",
};
