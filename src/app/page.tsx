"use client";

import Button from "@mui/material/Button";
import { Google } from "@mui/icons-material";
import { ReactElement, useContext, useEffect, useState } from "react";
import Image from "next/image";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { auth, createUser, signInWithGoogle } from "@/utils/firebase";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import { getAdditionalUserInfo, onAuthStateChanged } from "firebase/auth";
import { DataContext } from "@/components/DataProvider/DataProvider";

export default function Home(): ReactElement {
  const [state, setState] = useState<"loading" | "error" | undefined>(
    undefined
  );

  const { setTarget } = useContext(DataContext);

  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setTarget(0);
        router.push("/dashboard");
      }
    });
  }, [router, setTarget]);

  const handleGoogleLogin = () => {
    setState("loading");
    signInWithGoogle()
      .then((result) => {
        const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
        const email = auth.currentUser?.email;
        const name = auth.currentUser?.displayName;
        if (isNewUser && email != null && name != null) {
          createUser(name, email);
        }
      })
      .catch((error) => {
        console.error(error);
        setState("error");
      });
  };

  return (
    <Stack
      alignItems="center"
      height="100vh"
      sx={{
        bgcolor: "background.paper",
      }}
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={290}
        height={100}
        style={{ position: "absolute" }}
      />
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing="36px"
      >
        <Stack>
          <Typography
            variant="h2"
            color="primary.main"
            fontWeight="300"
            textAlign="center"
          >
            Manage your Mission Partners
          </Typography>
          <Typography
            variant="h1"
            color="primary.main"
            fontWeight="700"
            fontStyle="italic"
            textAlign="center"
            marginBottom="18px"
          >
            with ease.
          </Typography>
          <Typography variant="h6" color="primary.main" textAlign="center">
            MPD Easy allows for simple tracking of supporters and their
            donations.
            <br /> Say goodbye to those tedious spreadsheets!
          </Typography>
        </Stack>
        <Button
          disabled={state === "loading"}
          variant="contained"
          size="large"
          onClick={handleGoogleLogin}
          endIcon={
            state === "loading" ? (
              <CircularProgress
                size="27px"
                sx={{
                  color:
                    state === "loading"
                      ? "secondary.light"
                      : "background.paper",
                }}
              />
            ) : (
              <Google sx={{ height: "27px", width: "27px" }} />
            )
          }
          sx={{
            textTransform: "none",
            fontSize: "27px",
            height: "72px",
            width: "288px",
            borderRadius: "0px",
          }}
        >
          Login or Register
        </Button>
        {state === "error" && (
          <Typography
            variant="h6"
            color="primary.main"
            textAlign="center"
            fontWeight="bold"
            lineHeight="0px"
          >
            Error signing in. Please Try again.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
