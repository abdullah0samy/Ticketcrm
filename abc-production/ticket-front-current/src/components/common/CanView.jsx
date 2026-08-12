import { useSelector } from "react-redux";
import { Button, Card } from "@nextui-org/react";
import { t } from "i18next";
import { HiOutlineLockClosed } from "react-icons/hi";
import { Link } from "react-router-dom";

/**
 * Gate a route or a fragment behind the user's role.
 *
 * When a whole page is gated we owe the user an explanation — this used to
 * render the bare string "NotAllowed" into the layout.
 */
function CanView({ allowed = [], isPage, isReciever, children }) {
  const {
    userData: { role },
  } = useSelector((state) => state.account);

  if (allowed.includes(role)) {
    return children;
  }

  if (isPage) {
    return (
      <div className="box-center py-16 px-4">
        <Card radius="lg" shadow="sm" className="max-w-md w-full p-8 text-center">
          <div className="box-center mb-4">
            <span className="box-center w-14 h-14 rounded-full bg-warning-50 text-warning">
              <HiOutlineLockClosed className="text-3xl" />
            </span>
          </div>
          <h2 className="text-lg font-bold mb-1">{t("access denied")}</h2>
          <p className="text-sm text-default-500 mb-6">
            {t("your role does not have access to this page")}
          </p>
          <Button as={Link} to="/dashboard" color="primary" variant="flat" className="w-full sm:w-auto sm:self-center">
            {t("back to dashboard")}
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}

export default CanView;
