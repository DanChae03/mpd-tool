"use client";
import { Partner, Statistics, UserStatistics } from "@/utils/types";
import dayjs, { Dayjs } from "dayjs";
import { DocumentData } from "firebase/firestore";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { userData } from "./testData";

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
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  users: UserStatistics[];
  setUsers: Dispatch<SetStateAction<UserStatistics[]>>;
  setCoreData: (data: DocumentData) => void;
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
  const [stats, setStats] = useState<Statistics>({
    confirmed: 0,
    letters: 0,
    outstandingLetters: 0,
    pledged: 0,
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<UserStatistics[]>(userData);

  const setCoreData = (data: DocumentData) => {
    setMessage(data.message);
    setTarget(data.target);
    setDeadline(dayjs(data.deadline));
    setProject(data.project);
    setStats(data.stats);
    setPartners(data.partners);
    setIsAdmin(data.admin);
  };

  const [projects, setProjects] = useState<string[]>([]);

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
        isAdmin,
        setIsAdmin,
        users,
        setUsers,
        setCoreData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
