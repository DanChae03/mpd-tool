"use client";
import { Partner } from "@/utils/types";
import dayjs, { Dayjs } from "dayjs";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface DataProviderProps {
  children: ReactNode;
}

interface DataContextType {
  partners: Partner[];
  setPartners: Dispatch<SetStateAction<Partner[]>>;
  target: number;
  setTarget: Dispatch<SetStateAction<number>>;
  deadline: Dayjs;
  setDeadline: Dispatch<SetStateAction<Dayjs>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
}

export const DataContext = createContext<DataContextType>(
  {} as DataContextType
);

export function DataProvider({ children }: DataProviderProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [deadline, setDeadline] = useState<Dayjs>(dayjs());
  const [message, setMessage] = useState<string>("");

  return (
    <DataContext.Provider
      value={{
        partners,
        setPartners,
        target,
        setTarget,
        deadline,
        setDeadline,
        message,
        setMessage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
