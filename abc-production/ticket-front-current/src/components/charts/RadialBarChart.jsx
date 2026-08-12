import React from "react";
import { Card } from "@nextui-org/react";
import ChartTitle from "./ChartTitle";

const RadialBarChart = ({ value, title }) => {
  return (
    <Card radius="sm" shadow="sm">
      <h6 className="pt-3 text-base font-medium text-center">{title}</h6>
      <div className="h-full p-3 box-center">
        <svg
          id="SvgjsSvg1006"
          width="240"
          height="77"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          xmlnsSvgjs="http://svgjs.dev"
          className="apexcharts-svg"
          xmlnsData="ApexChartsNS"
          transform="translate(0, 0)"
          style={{ background: "transparent" }}
        >
          <foreignObject x="0" y="0" width="240" height="77">
            <div
              className="apexcharts-legend"
              xmlns="http://www.w3.org/1999/xhtml"
            ></div>
          </foreignObject>
          <g
            id="SvgjsG1008"
            className="apexcharts-inner apexcharts-graphical"
            transform="translate(45, 1)"
          >
            <defs id="SvgjsDefs1007">
              <clipPath id="gridRectMask0tkzlvjyf">
                <rect
                  id="SvgjsRect1009"
                  width="156"
                  height="160"
                  x="-4"
                  y="-6"
                  rx="0"
                  ry="0"
                  opacity="1"
                  strokeWidth="0"
                  stroke="none"
                  strokeDasharray="0"
                  fill="#fff"
                ></rect>
              </clipPath>
              <clipPath id="forecastMask0tkzlvjyf"></clipPath>
              <clipPath id="nonForecastMask0tkzlvjyf"></clipPath>
              <clipPath id="gridRectMarkerMask0tkzlvjyf">
                <rect
                  id="SvgjsRect1010"
                  width="154"
                  height="152"
                  x="-2"
                  y="-2"
                  rx="0"
                  ry="0"
                  opacity="1"
                  strokeWidth="0"
                  stroke="none"
                  strokeDasharray="0"
                  fill="#fff"
                ></rect>
              </clipPath>
            </defs>
            <g id="SvgjsG1011" className="apexcharts-radialbar">
              <g id="SvgjsG1012">
                <g id="SvgjsG1013" className="apexcharts-tracks">
                  <g
                    id="SvgjsG1014"
                    className="apexcharts-radialbar-track apexcharts-track"
                    rel="1"
                  >
                    <path
                      id="apexcharts-radialbarTrack-0"
                      d="M 21.963414634146332 74 A 53.03658536585367 53.03658536585367 0 0 1 128.03658536585368 74 "
                      fill="none"
                      fillOpacity="1"
                      stroke="rgba(231,231,231,0.85)"
                      strokeOpacity="1"
                      strokeLinecap="butt"
                      strokeWidth="9.155853658536586"
                      strokeDasharray="0"
                      className="apexcharts-radialbar-area"
                      data-pathOrig="M 21.963414634146332 74 A 53.03658536585367 53.03658536585367 0 0 1 128.03658536585368 74 "
                    ></path>
                  </g>
                </g>
                <g id="SvgjsG1016">
                  <g
                    id="SvgjsG1020"
                    className="apexcharts-series apexcharts-radial-series"
                    seriesName="Storage"
                    rel="1"
                    data-realIndex="0"
                  >
                    <path
                      id="SvgjsPath1021"
                      d="M 21.963414634146332 74 A 53.03658536585367 53.03658536585367 0 0 1 113.78850302855821 37.82913575717309 "
                      fill="none"
                      fillOpacity="0.85"
                      stroke="rgba(85,110,230,0.85)"
                      strokeOpacity="1"
                      strokeLinecap="butt"
                      strokeWidth="9.439024390243903"
                      strokeDasharray="3"
                      className="apexcharts-radialbar-area apexcharts-radialbar-slice-0"
                      data-angle="137"
                      data-value="76"
                      index="0"
                      j="0"
                      data-pathOrig="M 21.963414634146332 74 A 53.03658536585367 53.03658536585367 0 0 1 113.78850302855821 37.82913575717309 "
                    ></path>
                  </g>
                  <circle
                    id="SvgjsCircle1017"
                    r="43.458658536585375"
                    cx="75"
                    cy="74"
                    className="apexcharts-radialbar-hollow"
                    fill="transparent"
                  ></circle>
                  <g
                    id="SvgjsG1018"
                    className="apexcharts-datalabels-group"
                    transform="translate(0, 0) scale(1)"
                    style={{ opacity: 1 }}
                  >
                    <text
                      id="SvgjsText1019"
                      fontFamily="Helvetica, Arial, sans-serif"
                      x="75"
                      y="72"
                      textAnchor="middle"
                      dominantBaseline="auto"
                      fontSize="16px"
                      fontWeight="400"
                      fill="#373d3f"
                      className="apexcharts-text apexcharts-datalabel-value"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {value}%
                    </text>
                  </g>
                </g>
              </g>
            </g>
          </g>
          <line
            id="SvgjsLine1022"
            x1="0"
            y1="0"
            x2="150"
            y2="0"
            stroke="#b6b6b6"
            strokeDasharray="0"
            strokeWidth="1"
            strokeLinecap="butt"
            className="apexcharts-ycrosshairs"
          ></line>
          <line
            id="SvgjsLine1023"
            x1="0"
            y1="0"
            x2="150"
            y2="0"
            strokeDasharray="0"
            strokeWidth="0"
            strokeLinecap="butt"
            className="apexcharts-ycrosshairs-hidden"
          ></line>
        </svg>
      </div>
    </Card>
  );
};

export default RadialBarChart;
