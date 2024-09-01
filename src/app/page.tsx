import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Google } from "@mui/icons-material";
import { ReactElement } from "react";
import { Container } from "@mui/material";

export default function Home(): ReactElement {
  return (
    <Container
      sx={{
        backgroundColor: "#FFFFFF",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Button
        variant="outlined"
        endIcon={<Google />}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
        }}
      >
        Sign in with Google
      </Button>
    </Container>
  );
}
