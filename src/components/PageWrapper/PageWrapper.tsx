import Stack from "@mui/material/Stack";
import { ReactElement, ReactNode } from "react";
import { Navbar } from "../Navbar";
import Typography from "@mui/material/Typography";
import { UserIcon } from "../UserIcon";

interface PageWrapperProps {
  title: string;
  page: string;
  children: ReactNode;
}

export function PageWrapper({
  title,
  page,
  children,
}: PageWrapperProps): ReactElement {
  return (
    <Stack direction="row" height="100vh">
      <Navbar page={page} />
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
          paddingBottom="9px"
          justifyContent="space-between"
        >
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            {title}
          </Typography>
          <UserIcon />
        </Stack>
        {children}
      </Stack>
    </Stack>
  );
}
