import { Card, CardBody } from "@nextui-org/react";
import { t } from "i18next";
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Landing page for the PR service.
 *
 * This layout has no sidebar, so this page *is* the navigation. It used to
 * render three role-gated cards and nothing else — an administrator saw a
 * single card on an otherwise empty screen, with no way to reach the survey
 * archive even though the API grants them access. Every section the signed-in
 * user is actually allowed to open is now listed, with a heading that says
 * where they are.
 */
function HomePage() {
  const { userData } = useSelector((state) => state.account);
  const role = userData?.role;

  const pages = [
    {
      label: "create survey",
      description: "record a new patient satisfaction survey",
      link: "/create",
      img: "/image/create_pr.svg",
      allowed: ["agent"],
    },
    {
      label: "statistics",
      description: "satisfaction rates and category scores",
      link: "/statistics",
      img: "/image/statistics_pr.svg",
      // Managers run the department; administrators oversee the whole service.
      allowed: ["manager", "administration"],
    },
    {
      label: "view surveys",
      description: "browse and search recorded surveys",
      link: "/view",
      img: "/image/viwe_pr.svg",
      // Administrators may read surveys through the API, so hiding this card
      // from them left a section they are entitled to unreachable.
      allowed: ["manager", "agent", "administration"],
    },
  ];

  const visible = pages.filter((page) => page.allowed.includes(role));

  return (
    <div className="py-6">
      <div className="mb-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold capitalize">
          {t("patient relations")}
        </h1>
        <p className="text-sm text-default-500 mt-1">
          {t("choose a section to get started")}
        </p>
      </div>

      {visible.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {visible.map((page) => (
            <Card
              key={page.link}
              className="h-full"
              shadow="sm"
              radius="lg"
              isPressable
              as={Link}
              to={page.link}
            >
              <CardBody className="p-6 text-center flex flex-col items-center gap-3">
                <img
                  src={page.img}
                  alt=""
                  className="h-32 sm:h-36 object-contain"
                />
                <h2 className="text-lg sm:text-xl font-semibold capitalize">
                  {t(page.label)}
                </h2>
                <p className="text-sm text-default-500">{t(page.description)}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-default-400">
          {t("no sections are available for your role")}
        </p>
      )}
    </div>
  );
}

export default HomePage;
