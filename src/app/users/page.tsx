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
import { Order, UserStatistics } from "@/utils/types";
import { Search } from "@mui/icons-material";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

import {
  auth,
  fetchDocument,
  fetchProjects,
  fetchUsers,
} from "@/utils/firebase";
import { UserIcon } from "@/components/UserIcon";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { DataContext } from "@/components/DataProvider/DataProvider";
import CircularProgress from "@mui/material/CircularProgress";
import { StyledTable } from "@/components/StyledTable";
import { UsersContext } from "@/components/UsersProvider/UsersProvider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function comparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

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

export default function Users(): ReactElement {
  const {
    target,
    setCoreData,
    users,
    setUsers,
    projects,
    setProjects,
    isAdmin,
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
    searchKey,
    setSearchKey,
    currentProject,
    setCurrentProject,
    filteredUsers,
    setFilteredUsers,
  } = useContext(UsersContext);

  const router = useRouter();

  useEffect(() => {
    const getUsers = async () => {
      if (users.length === 0) {
        const newUsers = await fetchUsers();
        if (newUsers != null) {
          setUsers(newUsers);
        }
      }
    };

    getUsers();
  }, [setUsers, users]);

  useEffect(() => {
    const getData = async () => {
      const email = auth.currentUser?.email;
      if (target === 0 && email != null) {
        const data = await fetchDocument(email);
        if (data != null) {
          setCoreData(data);
        }
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user && !isAdmin) {
        router.push("/dashboard");
      } else if (user) {
        getData();
        getProjects();
      } else {
        router.push("/");
      }
    });

    const getProjects = async () => {
      if (projects.length === 0) {
        const data = await fetchProjects();
        if (data != null) {
          setProjects(data.projects);
        }
      }
    };
  }, [projects, router, setCoreData, setProjects, setUsers, target, users]);

  useEffect(() => {
    let filteredSearch = users;

    if (searchKey.trim() != "") {
      filteredSearch = filteredSearch.filter((user) =>
        user.name.toLowerCase().includes(searchKey.trim().toLowerCase())
      );
    }

    if (currentProject !== "No Project") {
      filteredSearch = filteredSearch.filter(
        (user) => user.project === currentProject
      );
    }

    setPage(0);
    setFilteredUsers(filteredSearch);
  }, [currentProject, searchKey, setFilteredUsers, setPage, users]);

  const handleRequestSort = (
    _event: MouseEvent<unknown>,
    property: keyof UserStatistics
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setPage(0);
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (_event: MouseEvent<unknown>, user: UserStatistics) => {};

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const visibleRows = useMemo(() => {
    const dataToUse =
      currentProject === "No Project" && searchKey.trim() === ""
        ? users
        : filteredUsers;

    return dataToUse
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [
    currentProject,
    searchKey,
    users,
    filteredUsers,
    order,
    orderBy,
    page,
    rowsPerPage,
  ]);

  return (
    <>
      {auth.currentUser?.displayName != undefined && target > 0 ? (
        <Stack direction="row" height="100vh">
          <Navbar page="users" />
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
                  Project Members
                </Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing="18px"
                paddingBottom="9px"
              >
                <Select
                  sx={{
                    width: "270px",
                    bgcolor: "background.paper",
                    fontSize: "18px",
                  }}
                  size="small"
                  value={currentProject}
                  onChange={(event) => setCurrentProject(event.target.value)}
                >
                  {projects.map((proj) => (
                    <MenuItem sx={{ height: "100%" }} value={proj} key={proj}>
                      {proj === "No Project" ? "Filter by Project" : proj}
                    </MenuItem>
                  ))}
                </Select>
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
                <UserIcon />
              </Stack>
            </Stack>
            <Paper sx={{ width: "100%", mb: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                  <StyledTable
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={() => {}}
                    onUsersRequestSort={handleRequestSort}
                    isPartners={false}
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
                              row.confirmed >= row.target
                                ? "#EDFCEF" // Light Green
                                : row.pledged >= row.target
                                  ? "#EDF7FC" // Light Blue
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
                            {row.letters}
                          </TableCell>
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
                            {row.outstandingLetters}
                          </TableCell>
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
                            ${row.pledged}
                          </TableCell>
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
                            ${row.confirmed}
                          </TableCell>
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
                            ${row.target}
                          </TableCell>
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
                            {row.project}
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
                  currentProject === "No Project" && searchKey.trim() === ""
                    ? users.length
                    : filteredUsers.length
                }
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Stack>
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
