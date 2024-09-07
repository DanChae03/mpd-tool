"use client";

import Stack from "@mui/material/Stack";
import { ReactElement, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { Partner } from "@/utils/types";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";
import { visuallyHidden } from "@mui/utils";
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
import { Alert, Switch } from "@mui/material";
import { auth, fetchDocument, fetchPartners } from "@/utils/firebase";
import Snackbar from "@mui/material/Snackbar";
import dayjs from "dayjs";
import { UserIcon } from "@/components/UserIcon";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

function comparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  if (aValue === null && bValue !== null) {
    return 1;
  }
  if (aValue !== null && bValue === null) {
    return -1;
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

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

interface HeadCell {
  disablePadding: boolean;
  id: keyof Partner;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "email",
    numeric: false,
    disablePadding: false,
    label: "Email",
  },
  {
    id: "number",
    numeric: false,
    disablePadding: false,
    label: "Number",
  },
  {
    id: "nextStepDate",
    numeric: false,
    disablePadding: false,
    label: "Next Step",
  },
  {
    id: "pledgedAmount",
    numeric: true,
    disablePadding: false,
    label: "Pledged Amount",
  },
  {
    id: "confirmedAmount",
    numeric: true,
    disablePadding: false,
    label: "Confirmed Amount",
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "saved",
    numeric: false,
    disablePadding: false,
    label: "Saved",
  },
];

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Partner
  ) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Partner) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontSize: "18px", color: "primary.main" }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function Partners(): ReactElement {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Partner>("id");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(8);
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<string[]>([
    "To Ask",
    "Asked",
    "Letter Sent",
    "Contacted",
    "Pledged",
    "Confirmed",
    "Rejected",
  ]);
  const [pledged, setPledged] = useState<number>(0);
  const [confirmed, setConfirmed] = useState<number>(0);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchKey, setSearchKey] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner>();
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>(
    "Operation successful."
  );

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const UID = auth.currentUser?.uid;
      if (UID != null) {
        const messageData = await fetchDocument(UID);
        if (messageData != null) {
          setMessage(messageData.message);
        }

        const partnerData = await fetchPartners(UID);
        if (partnerData.length !== 0) {
          setPartners(partnerData);
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
  }, [router]);

  useEffect(() => {
    const calculateTotals = () => {
      const totalPledged = partners.reduce((sum, partner) => {
        return sum + (partner.pledgedAmount ?? 0);
      }, 0);

      const totalConfirmed = partners.reduce((sum, partner) => {
        return sum + (partner.confirmedAmount ?? 0);
      }, 0);

      setPledged(totalPledged);
      setConfirmed(totalConfirmed);
    };

    calculateTotals();

    let filteredSearch = partners;

    if (searchKey.trim() != "") {
      filteredSearch = filteredSearch.filter((partner) =>
        partner.name.toLowerCase().includes(searchKey.toLowerCase())
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
  }, [filters, onlySaved, partners, searchKey]);

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
    _event: React.MouseEvent<unknown>,
    property: keyof Partner
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setPage(0);
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, partner: Partner) => {
    setSelectedPartner(partner);
    setDrawerOpen(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const handleMenuClose: () => void = () => {
    setAnchorElement(null);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - partners.length) : 0;

  const visibleRows = useMemo(() => {
    const dataToUse =
      filters.length === 6 && searchKey === "" ? partners : filteredPartners;

    return dataToUse
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [
    filters.length,
    searchKey,
    partners,
    filteredPartners,
    order,
    orderBy,
    page,
    rowsPerPage,
  ]);

  return (
    <Stack direction="row" height="100vh">
      <Link
        href="https://give.studentlife.org.nz/"
        style={{ position: "absolute" }}
      >
        <Stack width="270px" marginTop="45px" alignItems="center">
          <Image src="/logo.svg" alt="Logo" width={203} height={70} />
        </Stack>
      </Link>
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
              Total Pledged: ${pledged}
            </Typography>
            <Typography variant="h6" fontWeight="bold" paddingBottom="18px">
              Total Confirmed: ${confirmed}
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
            <IconButton onClick={handleMenuClick} sx={{ alignSelf: "center" }}>
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
              <Stack justifyContent="space-between" width="100%" spacing="0px">
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
              <EnhancedTableHead
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
                          row.confirmedAmount === row.pledgedAmount
                            ? "#EDFCEF"
                            : row.status === "Pledged"
                              ? "#EDF7FC"
                              : row.status === "Rejected"
                                ? "#FCEDED"
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
                          : dayjs(row.nextStepDate).format("DD/MM")}
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
                        {row.confirmedAmount ? `$${row.confirmedAmount}` : ""}
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
            rowsPerPageOptions={[4, 8, 10]}
            component="div"
            count={
              filters.length === 0 || searchKey !== ""
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
          setSelectedPartner(undefined);
        }}
      >
        <DrawerContent
          partner={selectedPartner}
          onClose={() => setDrawerOpen(false)}
          message={message}
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
  );
}
