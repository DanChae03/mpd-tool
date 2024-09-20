"use client";
import { Partner, Statistics } from "@/utils/types";
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
  project: string;
  setProject: Dispatch<SetStateAction<string>>;
  projects: string[];
  setProjects: Dispatch<SetStateAction<string[]>>;
  stats: Statistics;
  setStats: Dispatch<SetStateAction<Statistics>>;
}

export const DataContext = createContext<DataContextType>(
  {} as DataContextType
);

export function DataProvider({ children }: DataProviderProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [deadline, setDeadline] = useState<Dayjs>(dayjs());
  const [message, setMessage] = useState<string>("");
  const [project, setProject] = useState<string>("No Project");
  const [projects, setProjects] = useState<string[]>([]);
  const [stats, setStats] = useState<Statistics>({
    confirmed: 0,
    letters: 0,
    outstandingLetters: 0,
    pledged: 0,
  });

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
        project,
        setProject,
        projects,
        setProjects,
        stats,
        setStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
