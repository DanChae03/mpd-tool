"use client";

import Stack from "@mui/material/Stack";
import { ReactElement, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export default function Dashboard(): ReactElement {
  const [link, setLink] = useState<string>("");
  const [template, setTemplate] = useState<string>("");

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
      <Navbar page="settings" />
      <Stack
        height="100%"
        width="calc(100vw - 270px)"
        bgcolor="background.default"
        padding="63px"
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="primary.main"
          paddingBottom="18px"
        >
          Settings
        </Typography>
        <Stack spacing="9px" width="100%">
          <Typography variant="h5">Link to Support Raising Page:</Typography>
          <TextField
            sx={{ bgcolor: "background.paper" }}
            placeholder="https://give.studentlife.org.nz/appeals/project-year-your-name"
            value={link}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setLink(event.target.value);
            }}
          />
          <Typography variant="h5" paddingTop="18px">
            Default Email Text (This will pre-fill the draft of any emails you
            send).
          </Typography>
          <TextField
            multiline
            rows="12"
            value={template}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setTemplate(event.target.value);
            }}
            placeholder="Hello! I would like your support for my upcoming mission trip..."
            sx={{ bgcolor: "background.paper" }}
          />
          <Stack paddingTop="18px">
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                fontSize: "18px",
                height: "54px",
                width: "216px",
                borderRadius: "36px",
              }}
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
