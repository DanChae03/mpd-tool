export type Partner = {
  id: string; // unique
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

export type Order = "asc" | "desc";

export type Statistics = {
  confirmed: number;
  letters: number;
  outstandingLetters: number;
  pledged: number;
};
