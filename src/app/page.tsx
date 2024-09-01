import Button from "@mui/material/Button";
import { Google } from "@mui/icons-material";
import { ReactElement } from "react";
import Image from "next/image";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import "./globals.css";
import Link from "next/link";

export default function Home(): ReactElement {
  return (
    <Stack
      alignItems="center"
      height="100vh"
      sx={{
        backgroundColor: "background.paper",
      }}
    >
      <Link
        href="https://give.studentlife.org.nz/"
        style={{ position: "absolute" }}
      >
        <Image src="/logo.svg" alt="Logo" width={290} height={100} />
      </Link>
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing="36px"
      >
        <Stack>
          <Typography
            variant="h2"
            color="primary.main"
            fontWeight="300"
            textAlign="center"
          >
            Manage your Mission Partners
          </Typography>
          <Typography
            variant="h1"
            color="primary.main"
            fontWeight="700"
            fontStyle="italic"
            textAlign="center"
            marginBottom="18px"
          >
            with ease.
          </Typography>
          <Typography variant="h6" color="primary.main" textAlign="center">
            MPD Tool allows for simple tracking of supporters and their
            donations.
            <br /> Say goodbye to those tedious spreadsheets!
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="large"
          endIcon={<Google sx={{ height: "27px", width: "27px" }} />}
          sx={{
            textTransform: "none",
            fontSize: "27px",
            height: "72px",
            width: "288px",
            borderRadius: "0px",
          }}
        >
          Login or Register
        </Button>
      </Stack>
    </Stack>
  );
}
