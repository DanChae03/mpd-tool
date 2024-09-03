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
import { partners } from "../partners/testData";
import dayjs from "dayjs";
import { Chart } from "@/components/Chart";

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
    supporters: data("h3.mb-0").eq(1).text(),
    deadline: data("h3.mb-0").eq(2).text(),
  };

  return output;
}

export default function Dashboard(): ReactElement {
  const { support, supporters, deadline, target } = use(getData());

  const totalPledged = partners.reduce((sum, partner) => {
    return sum + (partner.pledgedAmount || 0);
  }, 0);

  const filteredPartners = partners
    .sort((a, b) => {
      const dateA = dayjs(a.nextStepDate);
      const dateB = dayjs(b.nextStepDate);

      if (dateA.isBefore(dateB)) return -1;
      if (dateA.isAfter(dateB)) return 1;
      return 0;
    })
    .filter(
      (partner) =>
        partner.nextStepDate != null && partner.status !== "Confirmed"
    )
    .slice(0, 4);

  const confirmed = partners
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
              <Typography variant="h5">
                ${totalPledged} pledged (
                {((totalPledged / parseInt(target)) * 100).toFixed(1)}
                %).
              </Typography>
            </CardActionArea>
          </Card>
          <Card sx={{ width: "100%" }}>
            <CardActionArea sx={{ padding: "45px", height: "100%" }}>
              <Stack direction="row" spacing="18px" alignItems="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {supporters}
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
            <CardActionArea
              sx={{ padding: "27px", height: "100%" }}
              href="/partners"
            >
              <Stack height="100%">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="primary.main"
                  paddingBottom="18px"
                >
                  Next Steps
                </Typography>
                <Stack height="100%" alignItems="center" spacing="9px">
                  {filteredPartners.length === 0 ? (
                    <Typography variant="h6" paddingBottom="18px">
                      {"No Next Steps. Let's get some new supporters!"}
                    </Typography>
                  ) : (
                    filteredPartners.map((partner) => (
                      <Stack
                        key={partner.id}
                        direction="row"
                        justifyContent="space-between"
                        width="100%"
                        height="100%"
                      >
                        <Stack>
                          <Typography variant="h6" fontWeight="bold">
                            {partner.name}
                          </Typography>
                          <Typography variant="body1">
                            {partner.status === "To Ask"
                              ? "Ask for Support"
                              : partner.status === "Asked"
                              ? "Send Letter"
                              : partner.status === "Letter Sent"
                              ? "Contact regarding letter"
                              : partner.status === "Contacted"
                              ? "Follow up regarding decision"
                              : "Follow up on pledge"}
                          </Typography>
                        </Stack>
                        <Typography variant="h6">
                          {dayjs(partner.nextStepDate).format("dddd, MMM DD")}
                        </Typography>
                      </Stack>
                    ))
                  )}
                </Stack>
              </Stack>
            </CardActionArea>
          </Card>
          <Card sx={{ width: "60%" }}>
            <CardActionArea sx={{ padding: "27px", height: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing="36px"
                height="100%"
              >
                <Chart partners={confirmed} />
              </Stack>
            </CardActionArea>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
}
