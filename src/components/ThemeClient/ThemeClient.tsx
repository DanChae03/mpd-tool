"use client";

import { theme } from "@/utils/theme";
import { ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

interface ThemeClientProps {
  children: ReactNode;
}

export function ThemeClient({ children }: ThemeClientProps) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
