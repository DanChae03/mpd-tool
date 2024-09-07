"use client";

import { Handshake, Settings, SpaceDashboard } from "@mui/icons-material";
import CardActionArea from "@mui/material/CardActionArea";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  page: string; // "dashboard" | "partners" | "settings";
}

export function Navbar({ page }: NavbarProps) {
  return (
    <Stack
      alignItems="center"
      height="100%"
      width="270px"
      bgcolor="background.paper"
    >
      <Link href="https://give.studentlife.org.nz/">
        <Stack width="270px" marginTop="45px" alignItems="center">
          <Image src="/logo.svg" alt="Logo" width={203} height={70} />
        </Stack>
      </Link>
      <Stack
        width="270px"
        justifyContent="center"
        height="100%"
        marginBottom="115px"
      >
        <Link
          href="/dashboard"
          replace
          style={{ textDecoration: "none", width: "100%" }}
        >
          <CardActionArea
            sx={{
              py: "18px",
              px: "45px",
              bgcolor:
                page !== "dashboard"
                  ? "background.paper"
                  : "background.default",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color={page === "dashboard" ? "primary.main" : "secondary.main"}
              justifyContent="space-between"
              alignItems="center"
              display="flex"
            >
              Dashboard
              <SpaceDashboard />
            </Typography>
          </CardActionArea>
        </Link>
        <Divider />
        <Link
          href="/partners"
          replace
          style={{ textDecoration: "none", width: "100%" }}
        >
          <CardActionArea
            sx={{
              py: "18px",
              px: "45px",
              bgcolor:
                page !== "partners" ? "background.paper" : "background.default",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color={page === "partners" ? "primary.main" : "secondary.main"}
              justifyContent="space-between"
              alignItems="center"
              display="flex"
            >
              Partners
              <Handshake />
            </Typography>
          </CardActionArea>
        </Link>
        <Divider />
        <Link
          href="/settings"
          replace
          style={{ textDecoration: "none", width: "100%" }}
        >
          <CardActionArea
            sx={{
              py: "18px",
              px: "45px",
              bgcolor:
                page !== "settings" ? "background.paper" : "background.default",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color={page === "settings" ? "primary.main" : "secondary.main"}
              justifyContent="space-between"
              alignItems="center"
              display="flex"
            >
              Settings
              <Settings />
            </Typography>
          </CardActionArea>
        </Link>
      </Stack>
    </Stack>
  );
}
