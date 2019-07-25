export enum TRANSACTION_TYPES {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  TRANSFER = "TRANSFER",
  CREDIT_CARD = "CREDIT_CARD"
}

export type FidorTransaction = {
  amount: number;
  description: string;
  date: Date;
  type: TRANSACTION_TYPES;
  reference: string;
  partner: string;
  exchange_rate?: number;
  exchange_amount?: number;
  exchange_fee?: number;
  exchange_pair?: string;
  iban?: string;
  uci?: string;
  bic?: string;
  umr?: string;
};
