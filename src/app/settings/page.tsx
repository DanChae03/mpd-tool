"use client";

import Stack from "@mui/material/Stack";
import { ReactElement, useContext, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { doc, updateDoc } from "firebase/firestore";
import { auth, database, fetchDocument, fetchPartners } from "@/utils/firebase";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Check } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { DataContext } from "@/components/DataProvider/DataProvider";
import { PageWrapper } from "@/components/PageWrapper";
import CircularProgress from "@mui/material/CircularProgress";

export default function Dashboard(): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [changed, setChanged] = useState<boolean>(false);
  const {
    target,
    setTarget,
    deadline,
    setDeadline,
    message,
    setMessage,
    setPartners,
  } = useContext(DataContext);
  const [currentTarget, setCurrentTarget] = useState<number>(target);
  const [currentDeadline, setCurrentDeadline] = useState<Dayjs>(deadline);
  const [currentMessage, setCurrentMessage] = useState<string>(message);

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      if (target === 0) {
        const UID = auth.currentUser?.uid;
        if (UID != null) {
          const data = await fetchDocument(UID);
          if (data != null) {
            setMessage(data.message);
            setTarget(data.target);
            setDeadline(dayjs(data.deadline));
            setCurrentMessage(data.message);
            setCurrentTarget(data.target);
            setCurrentDeadline(dayjs(data.deadline));
          }
          const partnerData = await fetchPartners(UID);
          if (partnerData.length !== 0) {
            setPartners(partnerData);
          }
        }
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        getData();
      } else {
        router.push("/");
      }
    });
  }, [router, setDeadline, setMessage, setPartners, setTarget, target]);

  const setData = async () => {
    const UID = auth.currentUser?.uid;
    if (UID != null) {
      await updateDoc(doc(database, "users", UID), {
        message: currentMessage,
        deadline: currentDeadline != null ? currentDeadline.toString() : null,
        target: currentTarget,
      }).then(() => {
        setMessage(currentMessage);
        setDeadline(currentDeadline);
        setTarget(currentTarget);
        setOpen(true);
        setChanged(false);
      });
    }
  };

  return (
    <>
      {auth.currentUser?.displayName != undefined &&
      (target > 0 || currentTarget > 0) ? (
        <PageWrapper title="Settings" page="settings">
          <Stack width="100%" spacing="18px">
            <Stack direction="row" alignItems="center" spacing="45px">
              <Stack spacing="9px">
                <Typography variant="h6">Support Deadline:</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={currentDeadline}
                    onChange={(newDate: Dayjs | null) => {
                      if (newDate != null) {
                        setCurrentDeadline(newDate);
                        setChanged(true);
                      }
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
                <Typography variant="h6">Support Target ($):</Typography>
                <TextField
                  value={currentTarget}
                  type="number"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCurrentTarget(parseFloat(event.target.value));
                    setChanged(true);
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
            <Stack spacing="9px">
              <Typography variant="h6">
                Default Email Text (This will pre-fill the draft of any emails
                you send).
              </Typography>
              <TextField
                multiline
                rows="12"
                value={currentMessage}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentMessage(event.target.value);
                  setChanged(true);
                }}
                slotProps={{
                  input: { style: { fontSize: "18px" } },
                }}
                placeholder="Hello! I would like your support for my upcoming mission trip..."
                sx={{ bgcolor: "background.paper" }}
              />
            </Stack>
            <Stack paddingTop="9px">
              <Button
                onClick={() => setData()}
                disabled={
                  !changed ||
                  Number.isNaN(currentTarget) ||
                  currentTarget < 0 ||
                  !currentMessage ||
                  currentMessage === ""
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
          <Snackbar
            open={open}
            autoHideDuration={3000}
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
        </PageWrapper>
      ) : (
        <Stack
          width="100vw"
          height="100vh"
          justifyContent="center"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing="27px">
            <Typography variant="h4" fontWeight="bold" color="primary">
              Loading...
            </Typography>
            <CircularProgress size="36px" />
          </Stack>
        </Stack>
      )}
    </>
  );
}
