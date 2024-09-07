"use client";
import { Partner } from "@/utils/types";
import dayjs, { Dayjs } from "dayjs";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
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

  const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    const storedValue =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (storedValue == null) {
      return defaultValue;
    } else {
      return JSON.parse(storedValue);
    }
  };

  const setLocalStorageItem = (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  useEffect(() => {
    setPartners(getLocalStorageItem<Partner[]>("partners", []));
    setTarget(getLocalStorageItem<number>("target", 0));
    setDeadline(
      dayjs(getLocalStorageItem<string>("deadline", dayjs().toString()))
    );
    setMessage(getLocalStorageItem<string>("message", ""));
  }, []);

  useEffect(() => {
    setLocalStorageItem("partners", partners);
  }, [partners]);

  useEffect(() => {
    setLocalStorageItem("target", target);
  }, [target]);

  useEffect(() => {
    setLocalStorageItem("deadline", deadline.toString());
  }, [deadline]);

  useEffect(() => {
    setLocalStorageItem("message", message);
  }, [message]);

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
