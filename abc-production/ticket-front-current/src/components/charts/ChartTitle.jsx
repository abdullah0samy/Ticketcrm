import React from "react";

/**
 * Card header for chart widgets.
 *
 * Titles used to be rendered by ApexCharts itself (`options.title`), which has two
 * problems inside narrow dashboard cards:
 *   1. ApexCharts draws the title as a single SVG text node — it never wraps, so a
 *      long title is clipped at both edges ("...10 departments sending ticke").
 *   2. It is painted in the same band as the chart toolbar, so the zoom/pan/menu
 *      icons sit on top of the text.
 *
 * Rendering the title as normal HTML above the canvas fixes both: it wraps, it is
 * selectable, and it can never collide with the toolbar.
 */
export default function ChartTitle({ children, className = "" }) {
  if (!children) return null;
  return (
    <h6
      title={typeof children === "string" ? children : undefined}
      className={`px-2 pt-1 pb-2 text-sm font-semibold leading-snug text-center text-[#263238] break-words ${className}`}
    >
      {children}
    </h6>
  );
}
