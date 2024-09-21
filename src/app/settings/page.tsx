"use client";

import Stack from "@mui/material/Stack";
import { ReactElement, useContext, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  auth,
  fetchDocument,
  fetchProjects,
  updateSettings,
} from "@/utils/firebase";
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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { CurrentSettings } from "@/utils/types";

export default function Dashboard(): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const {
    target,
    setTarget,
    deadline,
    setDeadline,
    message,
    setMessage,
    setProject,
    project,
    projects,
    setProjects,
    setCoreData,
  } = useContext(DataContext);

  const [settings, setSettings] = useState<CurrentSettings>({
    currentTarget: target,
    currentDeadline: deadline,
    currentMessage: message,
    currentProject: project,
    changed: false,
  });

  const handleSettingsChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
      changed: true,
    }));
  };

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const email = auth.currentUser?.email;
      if (target === 0 && email != null) {
        const data = await fetchDocument(email);
        if (data != null) {
          setCoreData(data);
          setSettings({
            currentMessage: data.message,
            currentTarget: data.target,
            currentDeadline: dayjs(data.deadline),
            currentProject: data.project,
            changed: false,
          });
        }
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        getData();
        getProjects();
      } else {
        router.push("/");
      }
    });

    const getProjects = async () => {
      if (projects.length === 0) {
        const data = await fetchProjects();
        if (data != null) {
          setProjects(data.projects);
        }
      }
    };
  }, [projects.length, router, setCoreData, setProjects, target]);

  const setData = async () => {
    const email = auth.currentUser?.email;
    if (email != null) {
      await updateSettings(email, {
        message: settings.currentMessage,
        deadline: settings.currentDeadline.toString(),
        target: settings.currentTarget,
        project: settings.currentProject,
      }).then(() => {
        setMessage(settings.currentMessage);
        setDeadline(settings.currentDeadline);
        setTarget(settings.currentTarget);
        setProject(settings.currentProject);
        setOpen(true);
        setSettings((prev) => ({ ...prev, changed: false }));
      });
    }
  };

  return (
    <>
      {auth.currentUser?.displayName != undefined &&
      (target > 0 || settings.currentTarget > 0) ? (
        <PageWrapper title="Settings" page="settings">
          <Stack width="100%" spacing="18px">
            <Stack direction="row" alignItems="center" spacing="45px">
              <Stack spacing="9px">
                <Typography variant="h6">Current Project:</Typography>
                <Select
                  sx={{
                    width: "270px",
                    height: "63px",
                    bgcolor: "background.paper",
                    fontSize: "18px",
                  }}
                  value={settings.currentProject}
                  onChange={(event) =>
                    handleSettingsChange("currentProject", event.target.value)
                  }
                >
                  {projects.map((proj) => (
                    <MenuItem sx={{ height: "100%" }} value={proj} key={proj}>
                      {proj}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
              <Stack spacing="9px">
                <Typography variant="h6">Support Deadline:</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={settings.currentDeadline}
                    onChange={(newDate: Dayjs | null) => {
                      if (newDate != null) {
                        handleSettingsChange("currentDeadline", newDate);
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
                  value={settings.currentTarget}
                  type="number"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSettingsChange(
                      "currentTarget",
                      parseFloat(event.target.value)
                    )
                  }
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
                value={settings.currentMessage}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSettingsChange("currentMessage", event.target.value)
                }
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
                  !settings.changed ||
                  Number.isNaN(settings.currentTarget) ||
                  settings.currentTarget < 0 ||
                  !settings.currentMessage
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
