"use client";

import Stack from "@mui/material/Stack";
import { ReactElement } from "react";

export default function Dashboard(): ReactElement {
  return (
    <Stack
      alignItems="center"
      height="100vh"
      sx={{
        backgroundColor: "secondary.dark",
      }}
    ></Stack>
  );
}
