"use client";
import { Partner, UserStatistics } from "@/utils/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface UsersProviderProps {
  children: ReactNode;
}

interface UsersContextType {
  order: "asc" | "desc";
  setOrder: Dispatch<SetStateAction<"asc" | "desc">>;
  orderBy: keyof UserStatistics;
  setOrderBy: Dispatch<SetStateAction<keyof UserStatistics>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  searchKey: string;
  setSearchKey: Dispatch<SetStateAction<string>>;
  currentProject: string;
  setCurrentProject: Dispatch<SetStateAction<string>>;
  filteredUsers: UserStatistics[];
  setFilteredUsers: Dispatch<SetStateAction<UserStatistics[]>>;
}

export const UsersContext = createContext<UsersContextType>(
  {} as UsersContextType
);

export function UsersProvider({ children }: UsersProviderProps) {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof UserStatistics>("id");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(8);
  const [searchKey, setSearchKey] = useState<string>("");
  const [currentProject, setCurrentProject] = useState<string>("No Project");
  const [filteredUsers, setFilteredUsers] = useState<UserStatistics[]>([]);

  return (
    <UsersContext.Provider
      value={{
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
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
