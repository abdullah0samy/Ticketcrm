import { HiOutlineMenuAlt1 } from "react-icons/hi";
import LangMenu from "../common/LangMenu";
import UserMenu from "../common/UserMenu";
import { Button, Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react";

/**
 * Header for the standalone PR app.
 *
 * The ticketing header also rendered <Notifications/>, which is driven by the
 * ticket WebSocket and its `notifications` redux slice — neither exists here, so
 * it is omitted rather than shipped broken.
 */
export default function Header({ openSidebar }) {
  return (
    <Navbar classNames={{ base: "z-30", wrapper: "!container " }} isBordered>
      <NavbarBrand className="flex gap-2">
        {openSidebar ? (
          <Button
            className="md:hidden"
            isIconOnly
            size="md"
            variant="bordered"
            onClick={openSidebar}
          >
            <HiOutlineMenuAlt1 className="text-lg" />
          </Button>
        ) : null}

        <p className="hidden sm:block font-bold text-inherit capitalize">
          PR System
        </p>
      </NavbarBrand>
      <NavbarContent as="div" justify="end">
        <div className="flex items-center gap-3">
          <LangMenu />
          <UserMenu />
        </div>
      </NavbarContent>
    </Navbar>
  );
}
