"use client";

import { Partner } from "@/utils/types";
import {
  AccountCircle,
  Call,
  Clear,
  Delete,
  DeleteForever,
  DeleteOutline,
  Edit,
  Email,
  Star,
  StarBorder,
  Undo,
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
import { ReactElement, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

interface DrawerContentProps {
  partner: Partner | undefined;
  onClose: () => void;
}

export function DrawerContent({
  partner,
  onClose,
}: DrawerContentProps): ReactElement {
  const [name, setName] = useState<string>(partner?.name ?? "");
  const [email, setEmail] = useState<string | undefined>(partner?.email);
  const [number, setNumber] = useState<string | undefined>(partner?.number);
  const [status, setStatus] = useState<string>(partner?.status ?? "To Ask");
  const [notes, setNotes] = useState<string>(partner?.notes ?? "");
  const [disabled, setDisabled] = useState<boolean>(partner != null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(partner?.saved ?? false);

  const [sentDate, setSentDate] = useState<Dayjs | null>(
    dayjs(partner?.sentDate) ?? dayjs()
  );
  const [pledgedAmount, setPledgedAmount] = useState<number | undefined>(
    partner?.pledgedAmount
  );
  const [confirmedDate, setConfirmedDate] = useState<Dayjs | null>(
    dayjs(partner?.confirmedDate) ?? dayjs()
  );
  const [confirmedAmount, setConfirmedAmount] = useState<number | undefined>(
    partner?.confirmedAmount
  );

  return (
    <Stack width="630px" padding="63px" spacing="18px">
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <Typography variant="h4" fontWeight="bold">
          {partner != null ? name : "New Partner"}
        </Typography>
        {partner != null && (
          <Stack direction="row" spacing="9px">
            <IconButton onClick={() => setSaved(!saved)}>
              {saved ? (
                <Star fontSize="large" sx={{ color: "#FFC443" }} />
              ) : (
                <StarBorder fontSize="large" />
              )}
            </IconButton>
            <IconButton
              disabled={email == null}
              sx={{ color: "#4C8BF5" }}
              href={`mailto:${email}`} // TODO: Subject and Body
            >
              <Email fontSize="large" />
            </IconButton>
            <IconButton
              disabled={number == null}
              sx={{ color: "#4C8BF5" }}
              href={`tel:${number}`}
            >
              <Call fontSize="large" />
            </IconButton>
            <IconButton onClick={() => setDisabled(!disabled)}>
              {disabled ? (
                <Edit fontSize="large" color={"primary"} />
              ) : (
                <Undo fontSize="large" color={"primary"} />
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
          placeholder="Last Name"
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
      {(status === "Confirmed" ||
        status === "Pledged" ||
        status === "Contacted" ||
        status === "Letter Sent") && (
        <Stack
          direction="row"
          alignItems="center"
          width="100%"
          justifyContent="space-between"
        >
          <Typography width="50%" fontWeight="bold" fontSize="18px">
            Date Letter Sent
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disabled={disabled}
              value={sentDate}
              onChange={(newDate: Dayjs | null) => setSentDate(newDate)}
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
            onChange={(event) => setPledgedAmount(parseInt(event.target.value))}
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
                setConfirmedAmount(parseInt(event.target.value))
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
            disabled={disabled}
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: "18px",
              height: "45px",
              width: "126px",
              borderRadius: "27px",
            }}
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
          <Button onClick={() => setDialogOpen(false)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
