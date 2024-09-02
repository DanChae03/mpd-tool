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
import { partners } from "./testData";
import IconButton from "@mui/material/IconButton";
import { Search, Tune } from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string | undefined | boolean | Date },
  b: { [key in Key]: number | string | undefined | boolean | Date }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Partner;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "firstName",
    numeric: false,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "lastName",
    numeric: false,
    disablePadding: false,
    label: "Surname",
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
    id: "sentDate",
    numeric: false,
    disablePadding: false,
    label: "Letter Sent",
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
  ]);
  const [pledged, setPledged] = useState<number>(0);
  const [confirmed, setConfirmed] = useState<number>(0);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchKey, setSearchKey] = useState<string>("");

  useEffect(() => {
    calculateTotals();
    const filtered = partners.filter(
      (partner) =>
        partner.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
        partner.lastName.toLowerCase().includes(searchKey.toLowerCase())
    );
    const filteredSearch = filtered.filter((partner) =>
      filters.includes(partner.status)
    );
    setFilteredPartners(filteredSearch);
  }, [filters, searchKey]);

  const calculateTotals = () => {
    const totalPledged = partners.reduce((sum, partner) => {
      return sum + (partner.pledgedAmount || 0);
    }, 0);

    const totalConfirmed = partners.reduce((sum, partner) => {
      return sum + (partner.confirmedAmount || 0);
    }, 0);

    setPledged(totalPledged);
    setConfirmed(totalConfirmed);
  };

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
    event: React.MouseEvent<unknown>,
    property: keyof Partner
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    console.log(id);
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
      >
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" alignItems="end" spacing="36px">
            <Typography
              variant="h3"
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
          <Stack direction="row" alignItems="center" spacing="18px">
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
                  width: "189px",
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
                  sx={{ width: "144px", justifyContent: "space-between" }}
                  checked={filters.includes("To Ask")}
                  onChange={() => handleSetFilters("To Ask")}
                />
                <FormControlLabel
                  value="start"
                  control={<Checkbox />}
                  label="Asked"
                  labelPlacement="start"
                  sx={{ width: "144px", justifyContent: "space-between" }}
                  checked={filters.includes("Asked")}
                  onChange={() => handleSetFilters("Asked")}
                />
                <FormControlLabel
                  value="start"
                  control={<Checkbox />}
                  label="Letter Sent"
                  labelPlacement="start"
                  sx={{ width: "144px", justifyContent: "space-between" }}
                  checked={filters.includes("Letter Sent")}
                  onChange={() => handleSetFilters("Letter Sent")}
                />
                <FormControlLabel
                  value="start"
                  control={<Checkbox />}
                  label="Contacted"
                  labelPlacement="start"
                  sx={{ width: "144px", justifyContent: "space-between" }}
                  checked={filters.includes("Contacted")}
                  onChange={() => handleSetFilters("Contacted")}
                />
                <FormControlLabel
                  value="start"
                  control={<Checkbox />}
                  label="Pledged"
                  labelPlacement="start"
                  sx={{ width: "144px", justifyContent: "space-between" }}
                  checked={filters.includes("Pledged")}
                  onChange={() => handleSetFilters("Pledged")}
                />
                <FormControlLabel
                  value="start"
                  control={<Checkbox />}
                  label="Confirmed"
                  labelPlacement="start"
                  sx={{ width: "144px", justifyContent: "space-between" }}
                  checked={filters.includes("Confirmed")}
                  onChange={() => handleSetFilters("Confirmed")}
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
                {visibleRows.map((row, index) => {
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      key={row.id}
                      sx={{
                        cursor: "pointer",
                        bgcolor:
                          row.confirmedAmount != null &&
                          row.confirmedAmount === row.pledgedAmount
                            ? "#D9FCDB"
                            : "inherit",
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ fontSize: "18px", fontWeight: "bold" }}
                      >
                        {row.firstName}
                      </TableCell>
                      <TableCell sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        {row.lastName}
                      </TableCell>
                      <TableCell sx={{ fontSize: "18px" }}>
                        {row.email || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "18px" }}>
                        {row.number || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "18px" }}>
                        {row.sentDate
                          ? row.sentDate.toLocaleDateString()
                          : "Not Sent"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "18px" }}>
                        {row.pledgedAmount !== undefined
                          ? `$${row.pledgedAmount}`
                          : "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "18px" }}>
                        {row.confirmedAmount !== undefined
                          ? `$${row.confirmedAmount}`
                          : "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "18px", fontWeight: "bold" }}
                        width="180px"
                      >
                        {row.status}
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
            rowsPerPageOptions={[4, 8, 12]}
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
    </Stack>
  );
}
