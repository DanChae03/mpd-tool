export type Partner = {
  id: number; // unique
  name: string;
  email: string | undefined;
  number: string | undefined;
  nextStepDate: Date | undefined; // DD/MM/YY
  pledgedAmount: number;
  confirmedDate: Date | undefined; // DD/MM/YY
  confirmedAmount: number;
  notes: string; // Sentence
  status: string;
  saved: boolean;
};
