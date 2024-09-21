"use client";

import Stack from "@mui/material/Stack";
import {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  MouseEvent,
  ChangeEvent,
} from "react";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { Order, Partner } from "@/utils/types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import {
  Add,
  Check,
  Search,
  Star,
  StarBorder,
  Tune,
} from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Drawer from "@mui/material/Drawer";
import { DrawerContent } from "@/components/DrawerContent";
import Button from "@mui/material/Button";
import { auth, database, fetchDocument } from "@/utils/firebase";
import Snackbar from "@mui/material/Snackbar";
import dayjs from "dayjs";
import { UserIcon } from "@/components/UserIcon";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { DataContext } from "@/components/DataProvider/DataProvider";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { doc, updateDoc } from "firebase/firestore";
import { StyledTable } from "@/components/StyledTable";
import { PartnersContext } from "@/components/PartnersProvider/PartnersProvider";

const stateOrder = new Map<string, number>([
  ["To Ask", 0],
  ["Asked", 1],
  ["Letter Sent", 2],
  ["Contacted", 3],
  ["Pledged", 4],
  ["Confirmed", 5],
  ["Rejected", 6],
]);

function comparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  if (aValue == null && bValue != null) {
    return 1;
  }
  if (aValue != null && bValue == null) {
    return -1;
  }

  if (orderBy === "status") {
    const aStatus = stateOrder.get(aValue as string) ?? 0;
    const bStatus = stateOrder.get(bValue as string) ?? 0;

    if (bStatus < aStatus) {
      return -1;
    }
    if (bStatus > aStatus) {
      return 1;
    }
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }

  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string | null | boolean | Date },
  b: { [key in Key]: number | string | null | boolean | Date }
) => number {
  return order === "asc"
    ? (a, b) => comparator(a, b, orderBy)
    : (a, b) => -comparator(a, b, orderBy);
}

export default function Partners(): ReactElement {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string>(
    "Operation successful."
  );

  const {
    partners,
    setPartners,
    setMessage,
    target,
    setTarget,
    setDeadline,
    setProject,
    stats,
    setStats,
  } = useContext(DataContext);

  const {
    order,
    setOrder,
    orderBy,
    setOrderBy,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filters,
    setFilters,
    filteredPartners,
    setFilteredPartners,
    searchKey,
    setSearchKey,
    selectedPartner,
    setSelectedPartner,
    onlySaved,
    setOnlySaved,
  } = useContext(PartnersContext);

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      if (target === 0) {
        const email = auth.currentUser?.email;
        if (email != null) {
          const data = await fetchDocument(email);
          if (data != null) {
            setMessage(data.message);
            setTarget(data.target);
            setDeadline(dayjs(data.deadline));
            setProject(data.project);
            setStats(data.stats);
            setPartners(data.partners);
          }
        }
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        getData();
      } else {
        router.push("/");
      }
    });
  }, [
    router,
    setDeadline,
    setMessage,
    setPartners,
    setProject,
    setStats,
    setTarget,
    target,
  ]);

  useEffect(() => {
    let filteredSearch = partners;

    if (searchKey.trim() != "") {
      filteredSearch = filteredSearch.filter((partner) =>
        partner.name.toLowerCase().includes(searchKey.trim().toLowerCase())
      );
    }

    if (filters.length !== 7) {
      filteredSearch = filteredSearch.filter((partner) =>
        filters.includes(partner.status)
      );
    }

    if (onlySaved) {
      filteredSearch = filteredSearch.filter((partner) => partner.saved);
    }

    setPage(0);
    setFilteredPartners(filteredSearch);
  }, [filters, onlySaved, partners, searchKey, setFilteredPartners, setPage]);

  useEffect(() => {
    const calculateStats = async () => {
      const newStats = {
        outstandingLetters: partners.filter(
          (partner) => partner.status === "Letter Sent"
        ).length,
        letters: partners.filter(
          (partner) =>
            partner.status !== "To Ask" &&
            partner.status !== "Asked" &&
            partner.status !== "Rejected"
        ).length,
        pledged: partners.reduce((sum, partner) => {
          return sum + (partner.pledgedAmount ?? 0);
        }, 0),
        confirmed: partners.reduce((sum, partner) => {
          return sum + (partner.confirmedAmount ?? 0);
        }, 0),
      };

      const email = auth.currentUser?.email;

      if (
        (stats.confirmed !== newStats.confirmed ||
          stats.pledged !== newStats.pledged ||
          stats.outstandingLetters !== newStats.outstandingLetters ||
          stats.letters !== newStats.letters) &&
        email != null
      ) {
        await updateDoc(doc(database, "users", email), {
          stats: newStats,
        }).then(() => setStats(newStats));
      }
    };

    calculateStats();
  }, [partners, setStats, stats]);

  const handleSetFilters = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter]);
    } else if (filters.length === 1) {
      return;
    } else {
      setFilters(filters.filter((status) => status !== filter));
    }
  };

  const handleRequestSort = (
    _event: MouseEvent<unknown>,
    property: keyof Partner
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setPage(0);
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (_event: MouseEvent<unknown>, partner: Partner) => {
    setSelectedPartner(partner);
    setDrawerOpen(true);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const handleMenuClose: () => void = () => {
    setAnchorElement(null);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - partners.length) : 0;

  const visibleRows = useMemo(() => {
    const dataToUse =
      filters.length === 7 && searchKey.trim() === "" && !onlySaved
        ? partners
        : filteredPartners;

    return dataToUse
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [
    filters.length,
    searchKey,
    onlySaved,
    partners,
    filteredPartners,
    order,
    orderBy,
    page,
    rowsPerPage,
  ]);

  return (
    <>
      {auth.currentUser?.displayName != undefined && target > 0 ? (
        <Stack direction="row" height="100vh">
          <Navbar page="partners" />
          <Stack
            height="100%"
            width="calc(100vw - 270px)"
            bgcolor="background.default"
            padding="63px"
            paddingTop="47px"
          >
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="end" spacing="36px">
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary.main"
                  paddingBottom="18px"
                >
                  Partners
                </Typography>
                <Typography variant="h6" fontWeight="bold" paddingBottom="18px">
                  Total Pledged: ${stats.pledged}
                </Typography>
                <Typography variant="h6" fontWeight="bold" paddingBottom="18px">
                  Total Confirmed: ${stats.confirmed}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing="18px"
                paddingBottom="9px"
              >
                <FormControl variant="outlined" size="small">
                  <InputLabel>Search</InputLabel>
                  <OutlinedInput
                    value={searchKey}
                    onChange={(event) => {
                      setSearchKey(event.target.value);
                    }}
                    label="Search"
                    sx={{ borderRadius: "20px", bgcolor: "background.paper" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <Search />
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{ alignSelf: "center" }}
                >
                  <Tune />
                </IconButton>
                <Button
                  variant="contained"
                  sx={{ borderRadius: "18px" }}
                  onClick={() => setDrawerOpen(true)}
                >
                  <Add />
                </Button>
                <UserIcon />
              </Stack>
              <Menu
                anchorEl={anchorElement}
                open={Boolean(anchorElement)}
                onClose={handleMenuClose}
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
                      width: "216px",
                      borderRadius: "9px",
                    },
                  },
                }}
              >
                <Card
                  elevation={0}
                  sx={{ paddingX: "27px", paddingY: "9px", width: "100%" }}
                >
                  <Stack
                    justifyContent="space-between"
                    width="100%"
                    spacing="0px"
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Filter
                    </Typography>
                    <FormControlLabel
                      value="start"
                      control={<Checkbox />}
                      label="To Ask"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      checked={filters.includes("To Ask")}
                      onChange={() => handleSetFilters("To Ask")}
                    />
                    <FormControlLabel
                      value="start"
                      control={<Checkbox />}
                      label="Asked"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      checked={filters.includes("Asked")}
                      onChange={() => handleSetFilters("Asked")}
                    />
                    <FormControlLabel
                      value="start"
                      control={<Checkbox />}
                      label="Letter Sent"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      checked={filters.includes("Letter Sent")}
                      onChange={() => handleSetFilters("Letter Sent")}
                    />
                    <FormControlLabel
                      value="start"
                      control={<Checkbox />}
                      label="Contacted"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      checked={filters.includes("Contacted")}
                      onChange={() => handleSetFilters("Contacted")}
                    />
                    <FormControlLabel
                      value="start"
                      control={<Checkbox />}
                      label="Pledged"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      checked={filters.includes("Pledged")}
                      onChange={() => handleSetFilters("Pledged")}
                    />
                    <FormControlLabel
                      value="start"
                      control={<Checkbox />}
                      label="Confirmed"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      checked={filters.includes("Confirmed")}
                      onChange={() => handleSetFilters("Confirmed")}
                    />
                    <FormControlLabel
                      value="start"
                      control={<Checkbox />}
                      label="Rejected"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      checked={filters.includes("Rejected")}
                      onChange={() => handleSetFilters("Rejected")}
                    />
                    <FormControlLabel
                      value="start"
                      control={<Switch checked={onlySaved} />}
                      label="Saved only?"
                      labelPlacement="start"
                      sx={{ width: "180px", justifyContent: "space-between" }}
                      onChange={() => setOnlySaved(!onlySaved)}
                    />
                  </Stack>
                </Card>
              </Menu>
            </Stack>
            <Paper sx={{ width: "100%", mb: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                  <StyledTable
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={partners.length}
                  />
                  <TableBody>
                    {visibleRows.map((row) => {
                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, row)}
                          key={row.id}
                          sx={{
                            cursor: "pointer",
                            bgcolor:
                              row.confirmedAmount &&
                              row.pledgedAmount &&
                              row.confirmedAmount >= row.pledgedAmount
                                ? "#EDFCEF" // Light Green
                                : row.status === "Pledged"
                                  ? "#EDF7FC" // Light Blue
                                  : row.status === "Rejected"
                                    ? "#FCEDED" // Light Red
                                    : "inherit",
                          }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "180px",
                            }}
                          >
                            {row.name}
                          </TableCell>

                          <TableCell
                            sx={{
                              fontSize: "18px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "270px",
                            }}
                          >
                            {row.email || ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "18px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "180px",
                            }}
                          >
                            {row.number || ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "18px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row.status === "Confirmed"
                              ? "Done"
                              : row.nextStepDate != null
                                ? dayjs(row.nextStepDate).format("DD/MM")
                                : "None"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "18px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row.pledgedAmount ? `$${row.pledgedAmount}` : ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "18px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row.confirmedAmount
                              ? `$${row.confirmedAmount}`
                              : ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color:
                                row.status === "Rejected"
                                  ? "primary.main"
                                  : row.status === "Confirmed"
                                    ? "#5CB85C"
                                    : row.status === "Pledged"
                                      ? "#4C8BF5"
                                      : "auto",
                            }}
                            width="180px"
                          >
                            {row.status}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "18px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Box display="flex">
                              {row.saved ? (
                                <Star sx={{ color: "#FFC443" }} />
                              ) : (
                                <StarBorder />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {emptyRows > 0 && (
                      <TableRow>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[4, 6, 8, 10, 15, 20]}
                component="div"
                count={
                  filters.length === 7 && searchKey.trim() === "" && !onlySaved
                    ? partners.length
                    : filteredPartners.length
                }
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Stack>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedPartner(null);
            }}
          >
            <DrawerContent
              partner={selectedPartner}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedPartner(null);
              }}
              setSnackbarOpen={() => setSnackbarOpen(true)}
              setSnackbarMessage={setSnackbarMessage}
            />
          </Drawer>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              variant="filled"
              icon={<Check fontSize="inherit" />}
              severity="success"
              sx={{ fontSize: "18px" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Stack>
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
