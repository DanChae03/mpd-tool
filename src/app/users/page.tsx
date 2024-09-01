import Stack from "@mui/material/Stack";
import { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";

export default function Users(): ReactElement {
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
      <Navbar page="users" />
      <Stack
        height="100%"
        width="calc(100vw - 270px)"
        bgcolor="background.default"
      ></Stack>
    </Stack>
  );
}
