import Stack from "@mui/material/Stack";
import { ReactElement, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";
import * as cheerio from "cheerio";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import { People, Savings, Today } from "@mui/icons-material";

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
          variant="h3"
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
          paddingBottom="36px"
        >
          <Card sx={{ width: "100%" }}>
            <CardActionArea sx={{ padding: "45px", height: "100%" }}>
              <Stack direction="row" spacing="18px" alignItems="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  ${support}
                </Typography>
                <Savings fontSize="large" sx={{ color: "primary.main" }} />
              </Stack>
              <Typography variant="h5">
                Of ${target} raised (
                {((parseInt(support) / parseInt(target)) * 100).toFixed(1)}%).
              </Typography>
              <Typography variant="h5">X pledged.</Typography>
            </CardActionArea>
          </Card>
          <Card sx={{ width: "100%" }}>
            <CardActionArea sx={{ padding: "45px", height: "100%" }}>
              <Stack direction="row" spacing="18px" alignItems="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {partners}
                </Typography>
                <People fontSize="large" sx={{ color: "primary.main" }} />
              </Stack>
              <Typography variant="h5">
                Partners supporting you in finance and prayer.
              </Typography>
            </CardActionArea>
          </Card>
          <Card sx={{ width: "100%" }}>
            <CardActionArea sx={{ padding: "45px", height: "100%" }}>
              <Stack direction="row" spacing="18px" alignItems="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {deadline}
                </Typography>
                <Today fontSize="large" sx={{ color: "primary.main" }} />
              </Stack>
              <Typography variant="h5">
                Days left until the 100% deadline.
              </Typography>
            </CardActionArea>
          </Card>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing="36px"
          height="100%"
        >
          <Card sx={{ width: "40%" }}>
            <CardActionArea sx={{ padding: "45px", height: "100%" }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="primary.main"
                paddingBottom="18px"
              >
                Relevant Events
              </Typography>
            </CardActionArea>
          </Card>
          <Card sx={{ width: "60%" }}>
            <CardActionArea sx={{ padding: "45px", height: "100%" }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="primary.main"
                paddingBottom="18px"
              >
                Graph
              </Typography>
            </CardActionArea>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
}
