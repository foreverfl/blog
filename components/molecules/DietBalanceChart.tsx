"use client";

import { area, axisBottom, axisLeft, line, scaleLinear, select } from "d3";
import React, { useEffect, useRef } from "react";

// An idealised week, not real records: burn and intake both hold steady, so the
// gap between them is the same 420 kcal every day.
const DAYS = [1, 2, 3, 4, 5, 6, 7];
const BURN = 2280; // 재택 2,100 + 걷기 180
const INTAKE = 1860;
// Eaten minus burned, so a deficit reads negative — same sign as the day cells.
const BALANCE = INTAKE - BURN;

const WIDTH = 560;
const HEIGHT = 320;
const MARGIN = { top: 24, right: 16, bottom: 40, left: 56 };

const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

const x = scaleLinear()
  .domain([DAYS[0], DAYS[DAYS.length - 1]])
  .range([0, innerWidth]);
const y = scaleLinear().domain([0, 3000]).range([innerHeight, 0]);

const toLine = (value: number) =>
  line<number>()
    .x((day) => x(day))
    .y(() => y(value))(DAYS) as string;

const burnPath = toLine(BURN);
const intakePath = toLine(INTAKE);

// The band between the two lines is the day's balance, drawn as one shape.
const bandPath = area<number>()
  .x((day) => x(day))
  .y0(() => y(BURN))
  .y1(() => y(INTAKE))(DAYS) as string;

interface DietBalanceChartProps {
  burnLabel: string;
  intakeLabel: string;
  bandLabel: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

const DietBalanceChart: React.FC<DietBalanceChartProps> = ({
  burnLabel,
  intakeLabel,
  bandLabel,
  xAxisLabel,
  yAxisLabel,
}) => {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);

  // d3 owns the axes; React owns everything else in the svg.
  useEffect(() => {
    if (xAxisRef.current) {
      select(xAxisRef.current).call(
        axisBottom(x)
          .ticks(DAYS.length)
          .tickFormat((value) => String(value))
          .tickSizeOuter(0),
      );
    }
    if (yAxisRef.current) {
      select(yAxisRef.current).call(
        axisLeft(y)
          .ticks(4)
          .tickFormat((value) => `${Number(value) / 1000}k`),
      );
    }
  }, []);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full text-gray-500 dark:text-gray-400"
      role="img"
    >
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        <g ref={xAxisRef} transform={`translate(0,${innerHeight})`} />
        <g ref={yAxisRef} />

        <path d={bandPath} fill="currentColor" opacity={0.15} />
        <path d={burnPath} fill="none" stroke="#2563eb" strokeWidth={2} />
        <path d={intakePath} fill="none" stroke="#ea580c" strokeWidth={2} />

        {DAYS.map((day) => (
          <g key={day}>
            <circle cx={x(day)} cy={y(BURN)} r={3} fill="#2563eb" />
            <circle cx={x(day)} cy={y(INTAKE)} r={3} fill="#ea580c" />
          </g>
        ))}

        {/* The band's area is the deficit piled up over the whole week. */}
        <text
          x={x(4)}
          y={y((BURN + INTAKE) / 2) + 4}
          textAnchor="middle"
          fill="currentColor"
          fontSize={12}
        >
          {BALANCE} × {DAYS.length} = {(BALANCE * DAYS.length).toLocaleString()}{" "}
          kcal
        </text>

        <text x={-MARGIN.left} y={-8} fill="currentColor" fontSize={12}>
          {yAxisLabel}
        </text>

        <text x={48} y={-8} fill="#2563eb" fontSize={12}>
          {burnLabel} {BURN.toLocaleString()}
        </text>
        <text x={152} y={-8} fill="#ea580c" fontSize={12}>
          {intakeLabel} {INTAKE.toLocaleString()}
        </text>
        <text x={256} y={-8} fill="currentColor" fontSize={12}>
          {bandLabel}
        </text>
        <text
          x={innerWidth}
          y={innerHeight + 34}
          textAnchor="end"
          fill="currentColor"
          fontSize={12}
        >
          {xAxisLabel}
        </text>
      </g>
    </svg>
  );
};

export default DietBalanceChart;
