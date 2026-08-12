import { useEffect } from "react";
import { Spinner } from "@nextui-org/react";
import { t } from "i18next";

/**
 * Sends the browser to another application.
 *
 * The PR screens used to live at /pr inside this app; they are now a separate
 * deployment. Old links (bookmarks, emails) still point here, so instead of a
 * 404 we forward them, preserving whatever sub-path was requested.
 */
export default function ExternalRedirect({ base, strip = "" }) {
  useEffect(() => {
    const rest = strip
      ? window.location.pathname.replace(new RegExp(`^${strip}`), "")
      : window.location.pathname;
    window.location.replace(`${base}${rest}${window.location.search}`);
  }, [base, strip]);

  return (
    <div className="box-center w-full min-h-[60vh] flex-col gap-3">
      <Spinner size="lg" />
      <p className="text-default-500">{t("redirecting")}…</p>
    </div>
  );
}
