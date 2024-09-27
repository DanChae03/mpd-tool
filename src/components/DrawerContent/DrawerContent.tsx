"use client";

import { Partner, CurrentPartner } from "@/utils/types";
import {
  Call,
  DeleteForever,
  Email,
  Star,
  StarBorder,
} from "@mui/icons-material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from "react";
import dayjs from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { auth, updateNewPartners } from "@/utils/firebase";
import { v4 as uuidv4 } from "uuid";
import { DataContext } from "../DataProvider/DataProvider";
import { useTheme } from "@mui/material";
import { PartnersContext } from "../PartnersProvider/PartnersProvider";

interface DrawerContentProps {
  onClose: () => void;
  setSnackbarOpen: () => void;
  setSnackbarMessage: Dispatch<SetStateAction<string>>;
}

export function DrawerContent({
  onClose,
  setSnackbarOpen,
  setSnackbarMessage,
}: DrawerContentProps): ReactElement {
  const { selectedPartner, setSelectedPartner } = useContext(PartnersContext);

  const [currentPartner, setCurrentPartner] = useState<CurrentPartner>({
    name: selectedPartner?.name ?? "",
    email: selectedPartner?.email ?? null,
    number: selectedPartner?.number ?? null,
    nextStepDate: selectedPartner?.nextStepDate
      ? dayjs(selectedPartner.nextStepDate).format("DD/MM/YYYY")
      : null,
    pledgedAmount: selectedPartner?.pledgedAmount ?? null,
    confirmedDate: selectedPartner?.confirmedDate
      ? dayjs(selectedPartner.confirmedDate).format("DD/MM/YYYY")
      : null,
    confirmedAmount: selectedPartner?.confirmedAmount ?? null,
    notes: selectedPartner?.notes ?? "",
    status: selectedPartner?.status ?? "To Ask",
    saved: selectedPartner?.saved ?? false,
  });

  const { setPartners, partners, message } = useContext(DataContext);

  const theme = useTheme();

  const handleFieldChange = (field: keyof CurrentPartner, value: any) => {
    setCurrentPartner((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePartners = (
    newPartner: Partner | null,
    id: string,
    isNew: boolean
  ) => {
    const userEmail = auth.currentUser?.email;
    if (userEmail != null) {
      if (newPartner != null && !isNew) {
        // Update
        const updatedPartners = partners.map((partner) =>
          partner.id === id ? newPartner : partner
        );
        updateNewPartners(userEmail, updatedPartners).then(() => {
          setSnackbarMessage(
            selectedPartner != null
              ? "Partner updated successfully."
              : "Partner created successfully."
          );
          setSnackbarOpen();
          setPartners(updatedPartners);
        });
      } else if (newPartner != null) {
        // New
        const updatedPartners = [...partners, newPartner];
        updateNewPartners(userEmail, updatedPartners).then(() => {
          setSnackbarMessage(
            selectedPartner != null
              ? "Partner updated successfully."
              : "Partner created successfully."
          );
          setSnackbarOpen();
          setPartners(updatedPartners);
          setSelectedPartner(newPartner);
        });
      } else {
        // Delete
        const updatedPartners = partners.filter((partner) => partner.id !== id);
        updateNewPartners(userEmail, updatedPartners).then(() => {
          setSnackbarMessage("Partner removed successfully.");
          setSnackbarOpen();
          setDialogOpen(false);
          onClose();
          setPartners(updatedPartners);
        });
      }
    }
  };

  const handleSave = () => {
    const userEmail = auth.currentUser?.email;
    if (userEmail != null) {
      const newPartner: Partner = {
        id: selectedPartner != null ? selectedPartner.id : uuidv4(),
        ...currentPartner,
        nextStepDate:
          currentPartner.nextStepDate != null &&
          currentPartner.status !== "Confirmed"
            ? dayjs(currentPartner.nextStepDate, "DD/MM/YYYY").toString()
            : null,
        pledgedAmount:
          currentPartner.pledgedAmount != null &&
          currentPartner.pledgedAmount > 0 &&
          (currentPartner.status === "Confirmed" ||
            currentPartner.status === "Pledged")
            ? currentPartner.pledgedAmount
            : null,
        confirmedAmount:
          currentPartner.confirmedAmount != null &&
          currentPartner.confirmedAmount > 0 &&
          currentPartner.status === "Confirmed"
            ? currentPartner.confirmedAmount
            : null,
        confirmedDate:
          currentPartner.confirmedDate != null &&
          currentPartner.status === "Confirmed"
            ? dayjs(currentPartner.confirmedDate, "DD/MM/YYYY").toString()
            : null,
      };
      updatePartners(newPartner, newPartner.id, selectedPartner == null);
    }
  };

  const handleDelete = async () => {
    const userEmail = auth.currentUser?.email;
    if (userEmail != null && selectedPartner != null) {
      updatePartners(null, selectedPartner.id, false);
    }
  };

  const enabled =
    (currentPartner.status === "Pledged"
      ? currentPartner.pledgedAmount != null && currentPartner.pledgedAmount > 0
      : currentPartner.status === "Confirmed"
        ? currentPartner.pledgedAmount != null &&
          currentPartner.pledgedAmount > 0 &&
          currentPartner.confirmedAmount != null &&
          currentPartner.confirmedAmount > 0 &&
          currentPartner.confirmedDate != null
        : true) &&
    currentPartner.name &&
    currentPartner.name.trim() &&
    currentPartner.nextStepDate !== "Invalid Date" &&
    currentPartner.confirmedDate !== "Invalid Date";

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <Stack width="630px" padding="63px" spacing="18px">
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems="center" spacing="9px">
          <Typography variant="h4" fontWeight="bold">
            {selectedPartner != null ? currentPartner.name : "New Partner"}
          </Typography>
          {selectedPartner != null && (
            <IconButton
              onClick={() => handleFieldChange("saved", !currentPartner.saved)}
            >
              {currentPartner.saved ? (
                <Star fontSize="large" sx={{ color: "#FFC443" }} />
              ) : (
                <StarBorder fontSize="large" />
              )}
            </IconButton>
          )}
        </Stack>
        {selectedPartner != null && (
          <Stack direction="row" spacing="9px">
            <IconButton
              disabled={!currentPartner.number}
              sx={{ color: "success.main" }}
              href={`tel:${currentPartner.number}`}
              target="_blank"
            >
              <Call fontSize="large" />
            </IconButton>
            <IconButton
              disabled={!currentPartner.email}
              sx={{ color: "#4C8BF5" }}
              href={`mailto:${currentPartner.email}?subject=Support Raising Letter - ${encodeURIComponent(currentPartner.name)}&body=${encodeURIComponent(message)}`}
              target="_blank"
            >
              <Email fontSize="large" />
            </IconButton>
          </Stack>
        )}
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="55%" fontWeight="bold" fontSize="18px">
          Current Status
        </Typography>
        <Select
          size="small"
          fullWidth
          value={currentPartner.status}
          onChange={(event) => handleFieldChange("status", event.target.value)}
        >
          <MenuItem value={"To Ask"}>To Ask</MenuItem>
          <MenuItem value={"Asked"}>Asked</MenuItem>
          <MenuItem value={"Letter Sent"}>Letter Sent</MenuItem>
          <MenuItem value={"Contacted"}>Contacted</MenuItem>
          <MenuItem value={"Pledged"}>Pledged</MenuItem>
          <MenuItem value={"Confirmed"}>Confirmed</MenuItem>
          <MenuItem value={"Rejected"}>Rejected</MenuItem>
        </Select>
      </Stack>
      {currentPartner.status !== "Rejected" &&
        currentPartner.status !== "Confirmed" && (
          <Stack
            direction="row"
            alignItems="center"
            width="100%"
            justifyContent="space-between"
          >
            <Typography width="55%" fontWeight="bold" fontSize="18px">
              Next Step Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={
                  currentPartner.nextStepDate
                    ? dayjs(currentPartner.nextStepDate, "DD/MM/YYYY")
                    : null
                }
                onChange={(newDate) =>
                  handleFieldChange(
                    "nextStepDate",
                    newDate ? newDate.format("DD/MM/YYYY") : null
                  )
                }
                format="DD/MM/YYYY"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.paper",
                    height: "40px",
                  },
                  "& .MuiIconButton-root": {
                    marginRight: "0px",
                  },
                }}
              />
            </LocalizationProvider>
          </Stack>
        )}
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="55%" fontWeight="bold" fontSize="18px">
          Name
          <span style={{ color: theme.palette.primary.main }}> *</span>
        </Typography>
        <TextField
          fullWidth
          placeholder="Full Name"
          size="small"
          value={currentPartner.name}
          onChange={(event) => handleFieldChange("name", event.target.value)}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="55%" fontWeight="bold" fontSize="18px">
          Email
        </Typography>
        <TextField
          fullWidth
          placeholder="example@example.com"
          size="small"
          value={currentPartner.email}
          onChange={(event) => handleFieldChange("email", event.target.value)}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="55%" fontWeight="bold" fontSize="18px">
          Number
        </Typography>
        <TextField
          fullWidth
          placeholder="Phone Number here"
          size="small"
          value={currentPartner.number}
          onChange={(event) => handleFieldChange("number", event.target.value)}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="55%" fontWeight="bold" fontSize="18px">
          Notes
        </Typography>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Notes"
          size="small"
          value={currentPartner.notes}
          onChange={(event) => handleFieldChange("notes", event.target.value)}
        />
      </Stack>
      {(currentPartner.status === "Pledged" ||
        currentPartner.status === "Confirmed") && (
        <Stack
          direction="row"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography width="55%" fontWeight="bold" fontSize="18px">
            Amount Pledged
            <span style={{ color: theme.palette.primary.main }}> *</span>
          </Typography>
          <TextField
            type="number"
            fullWidth
            placeholder="Pledged Amount"
            size="small"
            value={currentPartner.pledgedAmount ?? ""}
            onChange={(event) =>
              handleFieldChange("pledgedAmount", parseFloat(event.target.value))
            }
          />
        </Stack>
      )}
      {currentPartner.status === "Confirmed" && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            width="100%"
            justifyContent="space-between"
          >
            <Typography width="55%" fontWeight="bold" fontSize="18px">
              Amount Confirmed
              <span style={{ color: theme.palette.primary.main }}> *</span>
            </Typography>
            <TextField
              type="number"
              fullWidth
              placeholder="Confirmed Amount"
              size="small"
              value={currentPartner.confirmedAmount ?? ""}
              onChange={(event) =>
                handleFieldChange(
                  "confirmedAmount",
                  parseFloat(event.target.value)
                )
              }
            />
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            width="100%"
            justifyContent="space-between"
          >
            <Typography width="55%" fontWeight="bold" fontSize="18px">
              Date Received
              <span style={{ color: theme.palette.primary.main }}> *</span>
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={
                  currentPartner.confirmedDate
                    ? dayjs(currentPartner.confirmedDate, "DD/MM/YYYY")
                    : null
                }
                onChange={(newDate) =>
                  handleFieldChange(
                    "confirmedDate",
                    newDate ? newDate.format("DD/MM/YYYY") : null
                  )
                }
                format="DD/MM/YYYY"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.paper",
                    height: "40px",
                  },
                  "& .MuiIconButton-root": {
                    marginRight: "0px",
                  },
                }}
              />
            </LocalizationProvider>
          </Stack>
        </>
      )}
      <Stack direction="row" justifyContent="space-between" paddingTop="18px">
        <IconButton onClick={() => setDialogOpen(true)}>
          <DeleteForever fontSize="large" color="primary" />
        </IconButton>
        <Stack direction="row" justifyContent="flex-end" spacing="18px">
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontSize: "18px",
              height: "45px",
              width: "126px",
              borderRadius: "27px",
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!enabled}
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: "18px",
              height: "45px",
              width: "126px",
              borderRadius: "27px",
            }}
            onClick={() => handleSave()}
          >
            Save
          </Button>
        </Stack>
      </Stack>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle variant="h5" fontWeight="bold">
          {"Delete Contact"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="h6">
            Are you sure you want to delete this contact?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleDelete();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
