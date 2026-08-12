import React, { useCallback, useEffect, useState } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import {
  HiOutlineArrowDownTray,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMagnifyingGlassPlus,
} from "react-icons/hi2";
import { createPortal } from "react-dom";
import ErrorImage from "./ErrorImage";
import { t } from "i18next";

/**
 * Ticket attachments.
 *
 * Was a single column of full-width images with no keys and no way to see one
 * at full size — on a phone a screenshot of an error dialog was unreadable.
 * Now a thumbnail grid that opens into a lightbox with keyboard paging.
 */
function TicketAttach({ images = [] }) {
  const [active, setActive] = useState(null);

  const move = useCallback(
    (step) => {
      setActive((current) => {
        if (current === null) return current;
        const next = current + step;
        if (next < 0 || next >= images.length) return current;
        return next;
      });
    },
    [images.length]
  );

  useEffect(() => {
    if (active === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActive(null);
      // Arrow keys follow the visual order, which flips under RTL.
      const isRtl = document.dir === "rtl";
      if (event.key === "ArrowRight") move(isRtl ? -1 : 1);
      if (event.key === "ArrowLeft") move(isRtl ? 1 : -1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, move]);

  if (!images.length) {
    return (
      <div className="p-4">
        <ErrorImage image={"/not_found.svg"} text={t("no attechments")} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <p className="mb-3 text-small text-default-500">
        {images.length} {t("attachments")}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, index) => (
          <div
            key={img.id ?? img.image ?? index}
            className="group relative overflow-hidden rounded-lg border border-default-200 bg-default-100"
          >
            <button
              type="button"
              onClick={() => setActive(index)}
              className="block aspect-square w-full"
            >
              <img
                src={img.image}
                alt={`${t("attachments")} ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <HiOutlineMagnifyingGlassPlus className="text-3xl text-white" />
              </span>
            </button>
            <Tooltip content={t("download")}>
              <Button
                as="a"
                href={img.image}
                target="_blank"
                rel="noreferrer"
                download
                isIconOnly
                size="sm"
                radius="full"
                className="absolute end-1.5 top-1.5 bg-white/85 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={t("download")}
              >
                <HiOutlineArrowDownTray className="text-base" />
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>

      {active !== null &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => setActive(null)}
              aria-label={t("close")}
            />
            <img
              src={images[active].image}
              alt=""
              className="relative max-h-[85vh] max-w-full rounded-lg object-contain"
            />
            <Button
              isIconOnly
              radius="full"
              onPress={() => setActive(null)}
              className="absolute end-4 top-4 bg-white/15 text-white"
              aria-label={t("close")}
            >
              <HiOutlineXMark className="text-2xl" />
            </Button>
            {active > 0 && (
              <Button
                isIconOnly
                radius="full"
                onPress={() => move(-1)}
                className="absolute start-4 bg-white/15 text-white"
                aria-label={t("previous")}
              >
                <HiOutlineChevronLeft className="text-2xl rtl:rotate-180" />
              </Button>
            )}
            {active < images.length - 1 && (
              <Button
                isIconOnly
                radius="full"
                onPress={() => move(1)}
                className="absolute end-4 bg-white/15 text-white"
                aria-label={t("next")}
              >
                <HiOutlineChevronRight className="text-2xl rtl:rotate-180" />
              </Button>
            )}
            <span className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-small text-white">
              {active + 1} / {images.length}
            </span>
          </div>,
          document.body
        )}
    </div>
  );
}

export default TicketAttach;
