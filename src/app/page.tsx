import Button from "@mui/material/Button";
import { Google } from "@mui/icons-material";
import { ReactElement } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";

export default function Home(): ReactElement {
  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Button
        variant="contained"
        size="large"
        endIcon={<Google sx={{ height: "36px", width: "36px" }} />}
        sx={{
          textTransform: "none",
          fontWieght: "100",
          fontSize: "36px",
          height: "100px",
        }}
      >
        Sign in with Google
      </Button>
      <Image src="/logo.svg" alt="Logo" width={290} height={100} />
    </Box>
  );
}
