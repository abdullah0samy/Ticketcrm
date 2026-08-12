import { HiOutlineMenuAlt1 } from "react-icons/hi";
import LangMenu from "../common/LangMenu";
import Notifications from "../common/Notifications";
import UserMenu from "../common/UserMenu";
import { Button, Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react";

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
          support ticket
        </p>
      </NavbarBrand>
      <NavbarContent as="div" justify="end">
        <div className="flex itesm-center gap-3">
          <LangMenu />
          <Notifications />
          <UserMenu />
        </div>
      </NavbarContent>
    </Navbar>
  );
}
