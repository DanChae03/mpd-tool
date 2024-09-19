"use client";

import { auth } from "@/utils/firebase";
import { Logout } from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ReactElement, useState } from "react";

export function UserIcon(): ReactElement {
  const router = useRouter();

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const src: string | null | undefined = auth?.currentUser?.photoURL;

  const logout = () => {
    signOut(auth)
      .then(() => {
        router.push("/");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const handleClose: () => void = () => {
    setAnchorElement(null);
  };

  return (
    <Stack>
      <IconButton onClick={handleClick}>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: "50px",
            height: "50px",
          }}
          src={src ?? ""}
        />
      </IconButton>
      <Menu
        anchorEl={anchorElement}
        open={Boolean(anchorElement)}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: "150px",
              borderRadius: "9px",
            },
          },
        }}
      >
        <MenuItem onClick={() => logout()}>
          <Stack
            direction="row"
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <Typography fontWeight="500" variant="body2">
              Log Out
            </Typography>
            <Logout sx={{ height: "24px" }} />
          </Stack>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
