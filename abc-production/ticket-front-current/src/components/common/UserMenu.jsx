import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
} from "@nextui-org/react";

import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../redux/slices/accountSlice";
import { Link, useNavigate } from "react-router-dom";
import { t } from "i18next";
import { getFullName } from "../../utils/helper";
import { HiChevronDown } from "react-icons/hi";
import { ticketActions } from "../../redux/slices/ticketsSlice";
import { postActions } from "../../redux/slices/postsSlice";
import { useContext } from "react";
import { webSocketContext } from "../../socket-context";

export default function UserMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { disconnectSocket } = useContext(webSocketContext);
  const { userData } = useSelector((state) => state.account);

  const handleLogout = () => {
    dispatch(logOut());
    dispatch(ticketActions.restTickets());
    dispatch(postActions.restPosts());
    disconnectSocket();
    return navigate("/login");
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        {/* A bare coloured circle didn't read as an interactive menu. Show the
            user's photo (falling back to the hospital logo) inside a bordered
            pill with a caret, so it's obvious this opens a dropdown. */}
        <button
          type="button"
          aria-label={t("signed in as")}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white pl-1 pr-2 py-1 shadow-sm transition hover:bg-gray-50 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <img
            src={userData.image || "/logoo.png"}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/logoo.png";
            }}
            className="h-8 w-8 shrink-0 rounded-full border border-gray-100 bg-white object-contain"
          />
          <HiChevronDown className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">{t("signed in as")}</p>
          <p className="font-semibold">{getFullName(userData)}</p>
        </DropdownItem>
        {/* The "pr system" / "ticket system" switcher entries were removed:
            PR now runs as its own separate service, and this app IS the ticket
            system, so linking to it from inside itself was redundant. */}
        <DropdownItem key="settings" as={Link} to="/settings">
          {t("settings")}
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onPress={handleLogout}>
          {t("log out")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
