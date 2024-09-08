"use client";

import Stack from "@mui/material/Stack";
import { ReactElement, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  People,
  Savings,
  Today,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { Chart } from "@/components/Chart";
import { auth, fetchDocument, fetchPartners } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { DataContext } from "@/components/DataProvider/DataProvider";
import { PageWrapper } from "@/components/PageWrapper";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

export default function Dashboard(): ReactElement {
  const {
    partners,
    target,
    deadline,
    setPartners,
    setTarget,
    setDeadline,
    setMessage,
  } = useContext(DataContext);
  const router = useRouter();

  const [pagination, setPagination] = useState<number>(0);

  useEffect(() => {
    const getData = async () => {
      if (target === 0) {
        const UID = auth.currentUser?.uid;
        if (UID != null) {
          const data = await fetchDocument(UID);
          if (data != null) {
            setMessage(data.message);
            setTarget(data.target);
            setDeadline(dayjs(data.deadline));
          }
          const partnerData = await fetchPartners(UID);
          if (partnerData.length !== 0) {
            setPartners(partnerData);
          }
        }
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        getData();
      } else {
        router.push("/");
      }
    });
  }, [router, setDeadline, setMessage, setPartners, setTarget, target]);

  const totalPledged = partners.reduce((sum, partner) => {
    return sum + (partner.pledgedAmount ?? 0);
  }, 0);

  const support = partners.reduce((sum, partner) => {
    return sum + (partner.confirmedAmount ?? 0);
  }, 0);

  const supporters = partners.filter(
    (partner) => partner.confirmedAmount != null && partner.confirmedAmount
  ).length;

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
        partner.nextStepDate != null &&
        partner.status !== "Confirmed" &&
        partner.status !== "Rejected"
    );

  const paginationPartners = filteredPartners.slice(pagination, pagination + 4);

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

  const handlePagination = (add: boolean) => {
    if (add) {
      setPagination(pagination + 4);
    } else {
      setPagination(pagination - 4);
    }
  };

  return (
    <>
      {auth.currentUser?.displayName != undefined && target > 0 ? (
        <PageWrapper
          title={`Welcome, ${auth.currentUser?.displayName}`}
          page="dashboard"
        >
          <Stack
            direction="row"
            width="100%"
            justifyContent="space-between"
            spacing="36px"
            paddingBottom="36px"
            maxHeight="270px"
          >
            <Card sx={{ width: "100%", padding: "45px" }}>
              <Stack direction="row" spacing="18px" alignItems="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  ${support}
                </Typography>
                <Savings fontSize="large" sx={{ color: "primary.main" }} />
              </Stack>
              <Typography variant="h6">
                <>
                  Of ${target} raised ({((support / target) * 100).toFixed(1)}%)
                  <br /> ${totalPledged} pledged (
                  {((totalPledged / target) * 100).toFixed(1)}%)
                </>
              </Typography>
            </Card>
            <Card sx={{ width: "100%", padding: "45px" }}>
              <Stack direction="row" spacing="18px" alignItems="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {supporters}
                </Typography>
                <People fontSize="large" sx={{ color: "primary.main" }} />
              </Stack>

              <Typography variant="h6">
                Partners supporting you in finance and prayer
              </Typography>
            </Card>
            <Card sx={{ width: "100%", padding: "45px" }}>
              <Stack direction="row" spacing="18px" alignItems="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {deadline.diff(dayjs(), "day")}
                </Typography>
                <Today fontSize="large" sx={{ color: "primary.main" }} />
              </Stack>
              <Typography variant="h6">
                {`Days left until the 100% deadline (${deadline.format("dddd, DD MMMM")})`}
              </Typography>
            </Card>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing="36px"
            height="100%"
          >
            <Card
              sx={{
                width: "40%",
                maxHeight: "396px",
                padding: "27px",
                height: "100%",
              }}
            >
              <Stack height="100%">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  paddingBottom="9px"
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    Next Steps
                    {filteredPartners.length > 0
                      ? ` (${filteredPartners.length} Partners)`
                      : ""}
                  </Typography>
                  <Stack direction="row" alignItems="center">
                    <IconButton
                      disabled={pagination < 3}
                      onClick={() => handlePagination(false)}
                    >
                      <KeyboardArrowLeft />
                    </IconButton>
                    <IconButton
                      disabled={pagination + 4 > filteredPartners.length}
                      onClick={() => handlePagination(true)}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  </Stack>
                </Stack>
                <Stack spacing="18px">
                  {filteredPartners.length === 0 ? (
                    <Typography variant="h6" paddingBottom="18px">
                      {"No Next Steps. Let's get some new supporters!"}
                    </Typography>
                  ) : (
                    paginationPartners.map((partner) => (
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
                        <Typography variant="h6" textAlign="right">
                          {dayjs(partner.nextStepDate).format("dddd, DD/MM")}
                        </Typography>
                      </Stack>
                    ))
                  )}
                </Stack>
              </Stack>
            </Card>
            <Card sx={{ width: "60%", padding: "27px", maxHeight: "396px" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing="36px"
                height="100%"
              >
                <Chart partners={confirmedPartners} />
              </Stack>
            </Card>
          </Stack>
        </PageWrapper>
      ) : (
        <Stack
          width="100vw"
          height="100vh"
          justifyContent="center"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing="27px">
            <Typography variant="h4" fontWeight="bold" color="primary">
              Loading...
            </Typography>
            <CircularProgress size="36px" />
          </Stack>
        </Stack>
      )}
    </>
  );
}
