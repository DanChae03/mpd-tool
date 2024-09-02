export type Partner = {
  firstName: string;
  lastName: string;
  email: string | undefined;
  number: string | undefined;
  asked: boolean;
  sentLetter: boolean;
  sentDate: Date | undefined; // DD/MM/YY
  contacted: boolean;
  partner: boolean;
  pledgedAmount: number | undefined;
  confirmed: boolean;
  confirmedDate: Date | undefined; // DD/MM/YY
  confirmedAmount: number | undefined;
  notes: string; // Sentence
};
