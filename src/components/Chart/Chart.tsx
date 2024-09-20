"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { ReactElement, useContext } from "react";
import { DataContext } from "../DataProvider/DataProvider";

export function Chart(): ReactElement {
  const { partners } = useContext(DataContext);

  const names: string[] = [];
  const dates: (Date | null)[] = [];
  const amounts: (number | null)[] = [];
  const cumulativeAmounts: number[] = [];

  let cumulative = 0;

  const confirmedPartners = partners
    .filter(
      (partner) =>
        partner.confirmedAmount != null &&
        partner.confirmedAmount > 0 &&
        partner.confirmedDate != null
    )
    .sort((a, b) => {
      const dateA = dayjs(a.confirmedDate);
      const dateB = dayjs(b.confirmedDate);

      if (dateA.isBefore(dateB)) return -1;
      if (dateA.isAfter(dateB)) return 1;
      return 0;
    });

  confirmedPartners.forEach((partner) => {
    names.push(partner.name);
    dates.push(dayjs(partner.confirmedDate).toDate());
    amounts.push(partner.confirmedAmount);
    cumulativeAmounts.push((partner.confirmedAmount ?? 0) + cumulative);

    cumulative += partner.confirmedAmount ?? 0;
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
