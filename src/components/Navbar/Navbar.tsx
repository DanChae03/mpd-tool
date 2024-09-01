"use client";

import CardActionArea from "@mui/material/CardActionArea";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

interface NavbarProps {
  page: "dashboard" | "users" | "settings";
}

export function Navbar({ page }: NavbarProps) {
  const router = useRouter();
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="270px"
      bgcolor="background.paper"
    >
      <CardActionArea
        sx={{
          py: "18px",
          pl: "45px",
          bgcolor:
            page !== "dashboard" ? "background.paper" : "background.default",
        }}
        onClick={() => (page !== "dashboard" ? router.push("/dashboard") : {})}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color={page === "dashboard" ? "primary.main" : "secondary.main"}
        >
          Dashboard
        </Typography>
      </CardActionArea>
      <Divider />
      <CardActionArea
        sx={{
          py: "18px",
          pl: "45px",
          bgcolor: page !== "users" ? "background.paper" : "background.default",
        }}
        onClick={() => (page !== "users" ? router.push("/users") : {})}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color={page === "users" ? "primary.main" : "secondary.main"}
        >
          Manage Users
        </Typography>
      </CardActionArea>
      <Divider />
      <CardActionArea
        sx={{
          py: "18px",
          pl: "45px",
          bgcolor:
            page !== "settings" ? "background.paper" : "background.default",
        }}
        onClick={() => (page !== "settings" ? router.push("/settings") : {})}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color={page === "settings" ? "primary.main" : "secondary.main"}
        >
          Settings
        </Typography>
      </CardActionArea>
    </Stack>
  );
}
