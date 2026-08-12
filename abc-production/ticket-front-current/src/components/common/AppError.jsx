import { Button } from "@nextui-org/react";
import { HiOutlineExclamationCircle, HiOutlineHome } from "react-icons/hi";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { t } from "i18next";

/**
 * Route-level error screen.
 *
 * Without an `errorElement` React Router falls back to its raw developer page
 * ("Unexpected Application Error! 404 Not Found"), which is what users were
 * seeing for any bad URL.
 */
export default function AppError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="box-center w-full min-h-[70vh] p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-danger-50 text-danger box-center">
          <HiOutlineExclamationCircle className="text-4xl" />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {notFound ? t("page not found") : t("something went wrong")}
        </h1>

        <p className="text-default-500 mb-6">
          {notFound
            ? t("the page you are looking for does not exist or has moved.")
            : t("an unexpected error occurred. you can retry or go back home.")}
        </p>

        {!notFound && error?.message ? (
          <pre className="text-xs text-left text-danger-500 bg-danger-50 rounded-lg p-3 mb-6 overflow-auto max-h-32 whitespace-pre-wrap">
            {String(error.message)}
          </pre>
        ) : null}

        <div className="flex gap-3 justify-center">
          <Button as={Link} to="/" color="primary" startContent={<HiOutlineHome />}>
            {t("home")}
          </Button>
          <Button variant="bordered" onPress={() => window.location.reload()}>
            {t("retry")}
          </Button>
        </div>
      </div>
    </div>
  );
}
