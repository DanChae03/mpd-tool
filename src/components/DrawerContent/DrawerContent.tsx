"use client";

import { Partner } from "@/utils/types";
import {
  Call,
  Clear,
  DeleteForever,
  Edit,
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
import dayjs, { Dayjs } from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { auth, updateNewPartners } from "@/utils/firebase";
import { v4 as uuidv4 } from "uuid";
import { DataContext } from "../DataProvider/DataProvider";

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
  const [name, setName] = useState<string>(partner?.name ?? "");
  const [email, setEmail] = useState<string | undefined | null>(partner?.email);
  const [number, setNumber] = useState<string | undefined | null>(
    partner?.number
  );
  const [status, setStatus] = useState<string>(partner?.status ?? "To Ask");
  const [notes, setNotes] = useState<string>(partner?.notes ?? "");
  const [disabled, setDisabled] = useState<boolean>(partner != null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(partner?.saved ?? false);

  const [nextStepDate, setNextStepDate] = useState<Dayjs | null>(
    dayjs(partner?.nextStepDate)
  );
  const [pledgedAmount, setPledgedAmount] = useState<number>(
    partner?.pledgedAmount ?? 0
  );
  const [confirmedDate, setConfirmedDate] = useState<Dayjs | null>(
    dayjs(partner?.confirmedDate)
  );
  const [confirmedAmount, setConfirmedAmount] = useState<number>(
    partner?.confirmedAmount ?? 0
  );

  const { setPartners, partners, message } = useContext(DataContext);

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
        name: name,
        email: email || null,
        number: number || null,
        nextStepDate:
          nextStepDate != null && status !== "Confirmed"
            ? nextStepDate.toString()
            : null,
        pledgedAmount:
          pledgedAmount > 0 && (status === "Pledged" || status === "Confirmed")
            ? pledgedAmount
            : null,
        confirmedDate:
          confirmedDate != null && status === "Confirmed"
            ? confirmedDate.toString()
            : null,
        confirmedAmount:
          confirmedAmount > 0 && status === "Confirmed"
            ? confirmedAmount
            : null,
        notes: notes || null,
        status: status,
        saved: saved,
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
            {partner != null ? name : "New Partner"}
          </Typography>
          {partner != null && (
            <IconButton disabled={disabled} onClick={() => setSaved(!saved)}>
              {saved ? (
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
              disabled={!number}
              sx={{ color: "success.main" }}
              href={`tel:${number}`}
            >
              <Call fontSize="large" />
            </IconButton>
            <IconButton
              disabled={!email}
              sx={{ color: "#4C8BF5" }}
              href={`mailto:${email}?subject=Support Raising Letter - ${name}&body=${message}`}
            >
              <Email fontSize="large" />
            </IconButton>
            <IconButton onClick={() => setDisabled(!disabled)}>
              {disabled ? (
                <Edit fontSize="large" color={"primary"} />
              ) : (
                <Clear fontSize="large" color={"primary"} />
              )}
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
        <Typography width="50%" fontWeight="bold" fontSize="18px">
          Current Status
        </Typography>
        <Select
          disabled={disabled}
          size="small"
          fullWidth
          value={status}
          onChange={(event) => setStatus(event.target.value)}
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
      {status !== "Rejected" && status !== "Confirmed" && (
        <Stack
          direction="row"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography width="50%" fontWeight="bold" fontSize="18px">
            Next Step Date
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disabled={disabled}
              value={nextStepDate}
              onChange={(newDate: Dayjs | null) => setNextStepDate(newDate)}
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
        <Typography width="50%" fontWeight="bold" fontSize="18px">
          Name
        </Typography>
        <TextField
          disabled={disabled}
          fullWidth
          placeholder="Full Name"
          size="small"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="50%" fontWeight="bold" fontSize="18px">
          Email
        </Typography>
        <TextField
          disabled={disabled}
          fullWidth
          placeholder="example@example.com"
          size="small"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="50%" fontWeight="bold" fontSize="18px">
          Number
        </Typography>
        <TextField
          disabled={disabled}
          fullWidth
          placeholder="Phone Number here"
          size="small"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography width="50%" fontWeight="bold" fontSize="18px">
          Notes
        </Typography>
        <TextField
          disabled={disabled}
          fullWidth
          multiline
          maxRows={4}
          placeholder="Notes"
          size="small"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Stack>
      {(status === "Pledged" || status === "Confirmed") && (
        <Stack
          direction="row"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography width="50%" fontWeight="bold" fontSize="18px">
            Amount Pledged
          </Typography>
          <TextField
            disabled={disabled}
            type="number"
            fullWidth
            placeholder="Pledged Amount"
            size="small"
            value={pledgedAmount}
            onChange={(event) =>
              setPledgedAmount(parseFloat(event.target.value))
            }
          />
        </Stack>
      )}
      {status === "Confirmed" && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            width="100%"
            justifyContent="space-between"
          >
            <Typography width="50%" fontWeight="bold" fontSize="18px">
              Amount Confirmed
            </Typography>
            <TextField
              disabled={disabled}
              type="number"
              fullWidth
              placeholder="Confirmed Amount"
              size="small"
              value={confirmedAmount}
              onChange={(event) =>
                setConfirmedAmount(parseFloat(event.target.value))
              }
            />
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            width="100%"
            justifyContent="space-between"
          >
            <Typography width="50%" fontWeight="bold" fontSize="18px">
              Date Received
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disabled={disabled}
                value={confirmedDate}
                onChange={(newDate: Dayjs | null) => setConfirmedDate(newDate)}
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
            Exit
          </Button>
          <Button
            disabled={disabled || !name || !name.trim()}
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
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
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
