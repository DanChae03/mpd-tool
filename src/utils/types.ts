import { Dayjs } from "dayjs";

export type CurrentPartner = {
  name: string;
  email: string | null;
  number: string | null;
  nextStepDate: string | null; // DD/MM/YY
  pledgedAmount: number | null;
  confirmedDate: string | null; // DD/MM/YY
  confirmedAmount: number | null;
  notes: string | null; // Sentence
  status: string;
  saved: boolean;
};

export type Partner = {
  id: string; // unique
} & CurrentPartner;

export type Order = "asc" | "desc";

export type Statistics = {
  confirmed: number;
  letters: number;
  outstandingLetters: number;
  pledged: number;
};

export type UserStatistics = {
  name: string;
  project: string;
  id: string;
  target: number;
} & Statistics;

export type Settings = {
  message: string;
  deadline: string;
  target: number;
  project: string;
};

export type CurrentSettings = {
  currentTarget: number;
  currentDeadline: Dayjs;
  currentMessage: string;
  currentProject: string;
  changed: boolean;
};
