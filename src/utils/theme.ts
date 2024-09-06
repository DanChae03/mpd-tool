import { createTheme, Theme } from "@mui/material/styles";
import { Nunito_Sans } from "next/font/google";

const font = Nunito_Sans({ subsets: ["latin"], display: "swap" });

export const theme: Theme = createTheme({
  typography: {
    fontFamily: font.style.fontFamily,
  },
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
    success: {
      main: "#009925",
    },
  },
});
