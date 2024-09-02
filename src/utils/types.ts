export type Partner = {
  id: number; // unique
  firstName: string;
  lastName: string;
  email: string | undefined;
  number: string | undefined;
  sentDate: Date | undefined; // DD/MM/YY
  pledgedAmount: number | undefined;
  confirmedDate: Date | undefined; // DD/MM/YY
  confirmedAmount: number | undefined;
  notes: string; // Sentence
  status:
    | "To Ask"
    | "Asked"
    | "Letter Sent"
    | "Contacted"
    | "Pledged"
    | "Confirmed";
};
