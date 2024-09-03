"use client";

import { Partner } from "@/utils/types";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { ReactElement } from "react";

interface ChartProps {
  partners: Partner[]; // only those with confirmed amounts, sorted by chronological order
}

export function Chart({ partners }: ChartProps): ReactElement {
  const names: string[] = [];
  const dates: (Date | undefined)[] = [];
  const amounts: number[] = [];
  const cumulativeAmounts: number[] = [];

  let cumulative = 0;

  partners.forEach((partner) => {
    names.push(partner.name);
    dates.push(partner.confirmedDate);
    amounts.push(partner.confirmedAmount);
    cumulativeAmounts.push(partner.confirmedAmount + cumulative);
    cumulative += partner.confirmedAmount;
  });

  return (
    <LineChart
      xAxis={[
        {
          scaleType: "time",
          data: dates,
          valueFormatter: (value, context) =>
            context.location === "tick"
              ? dayjs(value).format("DD/MM")
              : dayjs(value).format("dddd, MMM DD"),
        },
      ]}
      series={[
        {
          data: cumulativeAmounts,
          label: "Support",
          color: "#E51937",
          valueFormatter: (value, { dataIndex }) => {
            return `$${value}: ${names[dataIndex]} gave $${amounts[dataIndex]}`;
          },
        },
      ]}
      width={700}
      height={300}
      margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
      sx={{ pointerEvents: partners.length === 0 ? "none" : "auto" }}
    />
  );
}
