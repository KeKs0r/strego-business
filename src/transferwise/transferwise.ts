import * as got from "got";
import { TRANSFERWISE_API_KEY } from "../config";
import { endOfDay, addHours } from "date-fns";
import { createPayment, ICheckAccountTransaction } from "../sevdesk/sevdesk";
import { CheckingAccounts } from "../sevdesk/sevdesk-config";

export const StregoProfile = "8319236";
export const USDAccount = "2912587";

enum TransferType {
  CREDIT = "CREDIT",
  DEBIBT = "DEBIT"
}

enum Currency {
  USD = "USD",
  EUR = "EUR"
}
type Amount = {
  value: number;
  currency: Currency;
};

enum DetailsType {
  DEPOSIT = "DEPOSIT",
  CARD = "CARD"
}

type TransactionMerchant = {
  name: string;
};

type TransactionDetails = {
  type: DetailsType;
  description: string;
  senderName: string;
  senderAccount: string;
  paymentReference: string;
  merchant: TransactionMerchant;
};

type PaymentStatus = "unpaid" | "paid";

type TransferwiseTransaction = {
  type: TransferType;
  date: Date;
  amount: Amount;
  totalFees: Amount;
  details: TransactionDetails;
  runningBalance: Amount;
  referenceNumber: string;
  feeAmount: Amount;
};

const client = got.extend({
  json: true,
  baseUrl: "https://api.transferwise.com/v1",
  headers: {
    Authorization: `Bearer ${TRANSFERWISE_API_KEY}`
  }
});

export async function getTransactions(
  since: Date
): Promise<Array<TransferwiseTransaction>> {
  const until = endOfDay(new Date());
  const activities = await client.get(
    `/borderless-accounts/${USDAccount}/statement.json?currency=USD&intervalStart=${since.toISOString()}&intervalEnd=${until.toISOString()}`
  );
  return activities.body.transactions;
}

export function mapToSevdesk(
  t: TransferwiseTransaction
): ICheckAccountTransaction {
  return {
    amount: t.amount.value,
    date: new Date(t.date),
    status: "unpaid" as PaymentStatus,
    additionalInformation: t.referenceNumber,
    feeAmount: t.totalFees.value,
    description: t.details.paymentReference || t.details.description,
    payeeName: t.details.senderName || t.details.merchant.name
  };
}

export async function syncDelta(s?: Date) {
  const since = s || addHours(new Date(), -5);

  const transactions = await getTransactions(since);
  const tasks = transactions.map(t =>
    createPayment(
      t.referenceNumber,
      CheckingAccounts.TransferwiseUSD,
      mapToSevdesk(t),
      t
    )
  );
  return Promise.all(tasks);
}

export default client;
