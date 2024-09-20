import { Order, Partner } from "@/utils/types";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { MouseEvent } from "react";
import { visuallyHidden } from "@mui/utils";

interface HeadCell {
  disablePadding: boolean;
  id: keyof Partner;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
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

interface StyledTableProps {
  onRequestSort: (event: MouseEvent<unknown>, property: keyof Partner) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export function StyledTable({
  order,
  orderBy,
  onRequestSort,
}: StyledTableProps) {
  const createSortHandler =
    (property: keyof Partner) => (event: MouseEvent<unknown>) => {
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
