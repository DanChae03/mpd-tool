import Stack from "@mui/material/Stack";
import { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";

export default function Dashboard(): ReactElement {
  // async function fetchUser() {
  //   const response = await fetch(
  //     "https://give.studentlife.org.nz/appeals/taiwan-2024-kenneth-santos"
  //   );
  //   const body = await response.text();

  //   console.log(body);
  // }

  // fetchUser();

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
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
      </Stack>
    </Stack>
  );
}
