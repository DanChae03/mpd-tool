"use client";

import { Partner, SelectedPartner } from "@/utils/types";
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

interface DrawerContentProps {
  partner: Partner | null;
  onClose: () => void;
  setSnackbarOpen: () => void;
  setSnackbarMessage: Dispatch<SetStateAction<string>>;
}

export function DrawerContent({
  partner,
  onClose,
  setSnackbarOpen,
  setSnackbarMessage,
}: DrawerContentProps): ReactElement {
  const [selectedPartner, setSelectedPartner] = useState<SelectedPartner>({
    name: partner?.name ?? "",
    email: partner?.email ?? null,
    number: partner?.number ?? null,
    nextStepDate: partner?.nextStepDate
      ? dayjs(partner.nextStepDate).format("DD/MM/YYYY")
      : null,
    pledgedAmount: partner?.pledgedAmount ?? null,
    confirmedDate: partner?.confirmedDate
      ? dayjs(partner.confirmedDate).format("DD/MM/YYYY")
      : null,
    confirmedAmount: partner?.confirmedAmount ?? null,
    notes: partner?.notes ?? "",
    status: partner?.status ?? "To Ask",
    saved: partner?.saved ?? false,
  });

  const { setPartners, partners, message } = useContext(DataContext);

  const theme = useTheme();

  const handleFieldChange = (field: keyof SelectedPartner, value: any) => {
    setSelectedPartner((prev) => ({
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
            partner != null
              ? "Partner updated successfully."
              : "Partner created successfully."
          );
          setSnackbarOpen();
          onClose();
          setPartners(updatedPartners);
        });
      } else if (newPartner != null) {
        // New
        const updatedPartners = [...partners, newPartner];
        updateNewPartners(userEmail, updatedPartners).then(() => {
          setSnackbarMessage(
            partner != null
              ? "Partner updated successfully."
              : "Partner created successfully."
          );
          setSnackbarOpen();
          onClose();
          setPartners(updatedPartners);
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
        id: partner != null ? partner.id : uuidv4(),
        ...selectedPartner,
        nextStepDate:
          selectedPartner.nextStepDate != null &&
          selectedPartner.status !== "Confirmed"
            ? dayjs(selectedPartner.nextStepDate, "DD/MM/YYYY").toString()
            : null,
        pledgedAmount:
          selectedPartner.pledgedAmount != null &&
          selectedPartner.pledgedAmount > 0 &&
          (selectedPartner.status === "Confirmed" ||
            selectedPartner.status === "Pledged")
            ? selectedPartner.pledgedAmount
            : null,
        confirmedAmount:
          selectedPartner.confirmedAmount != null &&
          selectedPartner.confirmedAmount > 0 &&
          selectedPartner.status === "Confirmed"
            ? selectedPartner.confirmedAmount
            : null,
        confirmedDate:
          selectedPartner.confirmedDate != null &&
          selectedPartner.status === "Confirmed"
            ? dayjs(selectedPartner.confirmedDate, "DD/MM/YYYY").toString()
            : null,
      };
      updatePartners(newPartner, newPartner.id, partner == null);
    }
  };

  const handleDelete = async () => {
    const userEmail = auth.currentUser?.email;
    if (userEmail != null && partner != null) {
      updatePartners(null, partner.id, false);
    }
  };

  const enabled =
    (selectedPartner.status === "Pledged"
      ? selectedPartner.pledgedAmount != null &&
        selectedPartner.pledgedAmount > 0
      : selectedPartner.status === "Confirmed"
        ? selectedPartner.pledgedAmount != null &&
          selectedPartner.pledgedAmount > 0 &&
          selectedPartner.confirmedAmount != null &&
          selectedPartner.confirmedAmount > 0 &&
          selectedPartner.confirmedDate != null
        : true) &&
    selectedPartner.name &&
    selectedPartner.name.trim();

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
            {partner != null ? selectedPartner.name : "New Partner"}
          </Typography>
          {partner != null && (
            <IconButton
              onClick={() => handleFieldChange("saved", !selectedPartner.saved)}
            >
              {selectedPartner.saved ? (
                <Star fontSize="large" sx={{ color: "#FFC443" }} />
              ) : (
                <StarBorder fontSize="large" />
              )}
            </IconButton>
          )}
        </Stack>
        {partner != null && (
          <Stack direction="row" spacing="9px">
            <IconButton
              disabled={!selectedPartner.number}
              sx={{ color: "success.main" }}
              href={`tel:${selectedPartner.number}`}
            >
              <Call fontSize="large" />
            </IconButton>
            <IconButton
              disabled={!selectedPartner.email}
              sx={{ color: "#4C8BF5" }}
              href={`mailto:${selectedPartner.email}?subject=Support Raising Letter - ${selectedPartner.name}&body=${message}`}
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
          value={selectedPartner.status}
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
      {selectedPartner.status !== "Rejected" &&
        selectedPartner.status !== "Confirmed" && (
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
                  selectedPartner.nextStepDate
                    ? dayjs(selectedPartner.nextStepDate, "DD/MM/YYYY")
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
          value={selectedPartner.name}
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
          value={selectedPartner.email}
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
          value={selectedPartner.number}
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
          value={selectedPartner.notes}
          onChange={(event) => handleFieldChange("notes", event.target.value)}
        />
      </Stack>
      {(selectedPartner.status === "Pledged" ||
        selectedPartner.status === "Confirmed") && (
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
            value={selectedPartner.pledgedAmount ?? ""}
            onChange={(event) =>
              handleFieldChange("pledgedAmount", parseFloat(event.target.value))
            }
          />
        </Stack>
      )}
      {selectedPartner.status === "Confirmed" && (
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
              value={selectedPartner.confirmedAmount ?? ""}
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
                  selectedPartner.confirmedDate
                    ? dayjs(selectedPartner.confirmedDate, "DD/MM/YYYY")
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
