import Stack from "@mui/material/Stack";
import { ReactElement, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";
import * as cheerio from "cheerio";
import Card from "@mui/material/Card";

async function getData() {
  const response = await fetch(
    "https://give.studentlife.org.nz/appeals/taiwan-2024-kenneth-santos"
  );
  const body = await response.text();
  const data = cheerio.load(body);

  const output = {
    support: data("h3.mb-0")
      .eq(0)
      .text()
      .replace(/[^0-9]/g, ""),
    target: data("h3.mb-0")
      .next()
      .text()
      .replace(/[^0-9]/g, ""),
    partners: data("h3.mb-0").eq(1).text(),
    deadline: data("h3.mb-0").eq(2).text(),
  };

  return output;
}

export default function Dashboard(): ReactElement {
  const { support, partners, deadline, target } = use(getData());

  return (
    <Stack direction="row" height="100vh">
      <Link
        href="https://give.studentlife.org.nz/"
        style={{ position: "absolute" }}
      >
        <Stack width="270px" marginTop="45px" alignItems="center">
          <Image src="/logo.svg" alt="Logo" width={203} height={70} />
        </Stack>
      </Link>
      <Navbar page="dashboard" />
      <Stack
        height="100%"
        width="calc(100vw - 270px)"
        bgcolor="background.default"
        padding="63px"
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="primary.main"
          paddingBottom="18px"
        >
          Dashboard
        </Typography>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          spacing="36px"
        >
          <Card sx={{ padding: "45px", width: "100%" }}>
            <Typography variant="h2" fontWeight="bold">
              ${support}
            </Typography>
            <Typography variant="h5">
              Of ${target} raised (
              {((parseInt(support) / parseInt(target)) * 100).toFixed(1)}%).
            </Typography>
            <Typography variant="h5">X pledged.</Typography>
          </Card>
          <Card sx={{ padding: "45px", width: "100%" }}>
            <Typography variant="h2" fontWeight="bold">
              {partners}
            </Typography>
            <Typography variant="h5">
              Partners supporting you in finance and prayer.
            </Typography>
          </Card>
          <Card sx={{ padding: "45px", width: "100%" }}>
            <Typography variant="h2" fontWeight="bold">
              {deadline}
            </Typography>
            <Typography variant="h5">
              Days left until the 100% deadline.
            </Typography>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
}
