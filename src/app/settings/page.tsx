"use client";

import Stack from "@mui/material/Stack";
import { ReactElement, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { doc, updateDoc } from "firebase/firestore";
import { auth, database, fetchDocument } from "@/utils/firebase";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Check } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard(): ReactElement {
  const [webpage, setWebpage] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [initialWebpage, setInitialWebpage] = useState<string>("");
  const [initialMessage, setInitialMessage] = useState<string>("");
  const [open, setOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });
  }, [router]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchDocument("X7NdCOkf9fRNEhvGTDw1kfSRMLX2");
      if (data != null) {
        setWebpage(data.webpage);
        setMessage(data.message);
        setInitialWebpage(data.webpage);
        setInitialMessage(data.message);
      }
    };
    getData();
  }, []);

  const setData = async () => {
    setInitialWebpage(webpage);
    setInitialMessage(message);
    await updateDoc(doc(database, "users", "X7NdCOkf9fRNEhvGTDw1kfSRMLX2"), {
      message: message,
      webpage: webpage,
    }).then(() => setOpen(true));
  };

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
            value={webpage}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setWebpage(event.target.value);
            }}
            slotProps={{
              input: { style: { fontSize: "18px" } },
            }}
          />
          <Typography variant="h5" paddingTop="18px">
            Default Email Text (This will pre-fill the draft of any emails you
            send).
          </Typography>
          <TextField
            multiline
            rows="12"
            value={message}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setMessage(event.target.value);
            }}
            slotProps={{
              input: { style: { fontSize: "18px" } },
            }}
            placeholder="Hello! I would like your support for my upcoming mission trip..."
            sx={{ bgcolor: "background.paper" }}
          />
          <Stack paddingTop="18px">
            <Button
              onClick={() => setData()}
              disabled={
                !webpage.startsWith(
                  "https://give.studentlife.org.nz/appeals/",
                ) ||
                (message === initialMessage && webpage === initialWebpage)
              }
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
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          variant="filled"
          icon={<Check fontSize="inherit" />}
          severity="success"
          sx={{ fontSize: "18px" }}
        >
          Saved Successfully.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
