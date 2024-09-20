"use client";
import { Partner } from "@/utils/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface PartnersProviderProps {
  children: ReactNode;
}

interface PartnersContextType {
  order: "asc" | "desc";
  setOrder: Dispatch<SetStateAction<"asc" | "desc">>;
  orderBy: keyof Partner;
  setOrderBy: Dispatch<SetStateAction<keyof Partner>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  filters: string[];
  setFilters: Dispatch<SetStateAction<string[]>>;
  filteredPartners: Partner[];
  setFilteredPartners: Dispatch<SetStateAction<Partner[]>>;
  searchKey: string;
  setSearchKey: Dispatch<SetStateAction<string>>;
  selectedPartner: Partner | null;
  setSelectedPartner: Dispatch<SetStateAction<Partner | null>>;
  onlySaved: boolean;
  setOnlySaved: Dispatch<SetStateAction<boolean>>;
}

export const PartnersContext = createContext<PartnersContextType>(
  {} as PartnersContextType
);

export function PartnersProvider({ children }: PartnersProviderProps) {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Partner>("id");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(8);
  const [filters, setFilters] = useState<string[]>([
    "To Ask",
    "Asked",
    "Letter Sent",
    "Contacted",
    "Pledged",
    "Confirmed",
    "Rejected",
  ]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchKey, setSearchKey] = useState<string>("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [onlySaved, setOnlySaved] = useState<boolean>(false);

  return (
    <PartnersContext.Provider
      value={{
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
      }}
    >
      {children}
    </PartnersContext.Provider>
  );
}
