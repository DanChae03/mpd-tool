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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { UserIcon } from "@/components/UserIcon";

export default function Dashboard(): ReactElement {
  const [deadline, setDeadline] = useState<Dayjs | null>(dayjs());
  const [message, setMessage] = useState<string>("");
  const [target, setTarget] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [changed, setChanged] = useState<boolean>(false);

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
      const UID = auth.currentUser?.uid;
      if (UID != null) {
        const data = await fetchDocument(UID);
        if (data != null) {
          setDeadline(dayjs(data.deadline));
          setMessage(data.message);
          setTarget(data.target);
        }
      }
    };
    getData();
  }, []);

  const setData = async () => {
    const UID = auth.currentUser?.uid;
    if (UID != null) {
      await updateDoc(doc(database, "users", UID), {
        message: message,
        deadline: deadline?.toString() ?? null,
        target: target,
      }).then(() => {
        setOpen(true);
        setChanged(false);
      });
    }
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
        paddingTop="47px"
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary.main"
            paddingBottom="18px"
          >
            Settings
          </Typography>
          <UserIcon />
        </Stack>
        <Stack width="100%" spacing="18px">
          <Stack direction="row" alignItems="center" spacing="45px">
            <Stack spacing="9px">
              <Typography variant="h5">Support Deadline:</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={deadline}
                  onChange={(newDate: Dayjs | null) => {
                    setDeadline(newDate);
                    setChanged(true);
                  }}
                  format="DD/MM/YYYY"
                  sx={{
                    width: "270px",
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                      height: "63px",
                      fontSize: "18px",
                    },
                    "& .MuiIconButton-root": {
                      marginRight: "0px",
                    },
                  }}
                />
              </LocalizationProvider>
            </Stack>
            <Stack spacing="9px">
              <Typography variant="h5">Support Target ($):</Typography>
              <TextField
                value={target}
                type="number"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setTarget(parseInt(event.target.value));
                }}
                slotProps={{
                  input: { style: { fontSize: "18px", height: "63px" } },
                }}
                placeholder="Hello! I would like your support for my upcoming mission trip..."
                sx={{
                  bgcolor: "background.paper",
                  width: "270px",
                }}
              />
            </Stack>
          </Stack>
          <Typography variant="h5">
            Default Email Text (This will pre-fill the draft of any emails you
            send).
          </Typography>
          <TextField
            multiline
            rows="12"
            value={message}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setMessage(event.target.value);
              setChanged(true);
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
              disabled={!changed || Number.isNaN(target) || target < 0}
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
