"use client";

import Stack from "@mui/material/Stack";
import { ReactElement, useContext, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  People,
  Savings,
  Today,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { Chart } from "@/components/Chart";
import { auth, fetchDocument, setNewUser } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { DataContext } from "@/components/DataProvider/DataProvider";
import { PageWrapper } from "@/components/PageWrapper";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";

export default function Dashboard(): ReactElement {
  const {
    partners,
    setPartners,
    target,
    setTarget,
    deadline,
    setDeadline,
    setMessage,
    setProject,
    stats,
    setStats,
  } = useContext(DataContext);

  const router = useRouter();

  const [pagination, setPagination] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      const email = auth.currentUser?.email;
      if (target === 0 && email != null) {
        const data = await fetchDocument(email);
        if (data != null) {
          setMessage(data.message);
          setTarget(data.target);
          setDeadline(dayjs(data.deadline));
          setOpen(data.newUser);
          setProject(data.project);
          setStats(data.stats);
          setPartners(data.partners);
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
  }, [
    router,
    setDeadline,
    setMessage,
    setPartners,
    setProject,
    setStats,
    setTarget,
    target,
  ]);

  const completeOnboarding = async () => {
    const email = auth.currentUser?.email;
    if (email != null) {
      await setNewUser(email).then(() => {
        setOpen(false);
      });
    }
  };

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

  console.log(paginationPartners);

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
                  ${stats.confirmed}
                </Typography>
                <Savings fontSize="large" sx={{ color: "primary.main" }} />
              </Stack>
              <Typography variant="h6">
                <>
                  Of ${target} raised (
                  {((stats.confirmed / target) * 100).toFixed(1)}
                  %)
                  <br /> ${stats.pledged} pledged (
                  {((stats.pledged / target) * 100).toFixed(1)}%)
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
                <Chart />
              </Stack>
            </Card>
          </Stack>
          <Dialog open={open}>
            <Card sx={{ width: "100%", padding: "45px" }}>
              <Stack spacing="18px" alignItems="center">
                <Typography variant="h4" fontWeight="bold" color="primary">
                  Welcome to MPD Easy!
                </Typography>
                <Typography variant="h6" textAlign="center">
                  This tool was developed by Dan Chae after he tried to support
                  raise for an International project using an Excel spreadsheet.
                </Typography>
                <Typography variant="h6" fontWeight="bold" textAlign="center">
                  {`Get started by going to the Settings Page and changing the
                  Support target and Deadline date to that of your Project's.
                  Make sure to save your changes.`}
                </Typography>
                <Typography variant="h6" fontWeight="bold" textAlign="center">
                  Then, go to the Partners section and add some of your partners
                  with the Plus button at the top right!
                </Typography>
                <Typography variant="h6" textAlign="center">
                  All the best with Support Raising!
                </Typography>
                <Button
                  onClick={() => {
                    completeOnboarding();
                    setOpen(false);
                  }}
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    fontSize: "18px",
                    height: "54px",
                    width: "216px",
                    borderRadius: "36px",
                  }}
                >
                  Get Started
                </Button>
              </Stack>
            </Card>
          </Dialog>
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
