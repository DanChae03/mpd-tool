"use client";

import { createTheme, Theme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

const theme: Theme = createTheme({
  palette: {
    primary: {
      main: "#E51937",
      dark: "#B5142C",
    },
    secondary: {
      main: "#7E7E7E",
      dark: "#000000",
    },
    background: {
      default: "#F5F6FA",
      paper: "#FFFFFF",
    },
    error: {
      main: "#4218C9",
    },
  },
});

interface ThemeClientProps {
  children: ReactNode;
}

export function ThemeClient({ children }: ThemeClientProps) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
