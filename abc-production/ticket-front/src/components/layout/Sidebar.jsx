import React from "react";
import { Button } from "react-bootstrap";
import User from "../elements/User";
import { Close } from "../Icons";
import { useSelector, useDispatch } from "react-redux";
import { closeSidebar } from "../../store/Slice/sidebarSlice";
import Navigation from './../elements/Navigation';

function Sidebar() {
  const { isOpen } = useSelector((state) => state.Sidebar);
  const dispatch = useDispatch();

  return (
    <aside className={`sidebar bg-white px-2 py-3 ${isOpen ? "show" : null}`}>
      <div className="w-100 h-100 position-relative d-flex flex-column">
        <div>
          <Button
            variant="light"
            className="w-100 mb-3 d-lg-none"
            onClick={() => dispatch(closeSidebar())}
          >
            <Close />
          </Button>
          <User />
          <Navigation />
        </div>

        <div gap={2} className="w-100 mt-auto">
          <p className="fw-light text-center">@2023 all copyrights reserved by ABC Hospital IT Team</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
