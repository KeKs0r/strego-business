import * as got from "got";
import { TRANSFERWISE_API_KEY } from "../config";
import { endOfDay, addHours } from "date-fns";
import { createPayment, ICheckAccountTransaction } from "../sevdesk/sevdesk";

export const StregoProfile = "8319236";
export const USDAccount = "2912587";

enum TransferType {
  CREDIT = "CREDIT"
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
  DEPOSIT = "DEPOSIT"
}

type TransactionDetails = {
  type: DetailsType;
  description: string;
  senderName: string;
  senderAccount: string;
  paymentReference: string;
};

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
    payeeName: t.details.senderName,
    amount: t.amount.value,
    date: new Date(t.date),
    status: "unpaid",
    description: t.details.paymentReference,
    feeAmount: t.totalFees.value,
    additionalInformation: t.referenceNumber
  };
}

export async function syncDelta(s?: Date) {
  const since = s || addHours(new Date(), -5);

  const transactions = await getTransactions(since);
  const tasks = transactions.map(t =>
    createPayment(t.referenceNumber, mapToSevdesk(t), t)
  );
  return Promise.all(tasks);
}

export default client;
