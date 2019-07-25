import {
  SevdeskAccount,
  SevdeskTransaction,
  ISevdeskTransaction
} from "@mojoio/sevdesk";
import { CheckingAccounts } from "./sevdesk-config";
import { SEVDESK_API_KEY } from "../config";
import firebase from "../service/firebase";
import cleanObject from "./util/clean-object";

const db = firebase.firestore();

export enum Status {
  CREATED = "100",
  PAID = "1000" // Or cancelled, not clear :(
}

export enum Currency {
  USD = "USD",
  EUR = "EUR"
}

export type ICheckAccountTransaction = ISevdeskTransaction & {
  feeAmount?: number;
  additionalInformation: string;
};

export const sevClient = new SevdeskAccount(SEVDESK_API_KEY);

export async function createPayment(
  referenceId: string,
  transaction: ISevdeskTransaction,
  meta: object
) {
  const docRef = db.collection("sevdesk-payments").doc(referenceId);
  return docRef.set({
    transaction: cleanObject(transaction),
    meta: cleanObject(meta)
  });
}

export async function createPaymentFromStore(transaction: ISevdeskTransaction) {
  const payment = new SevdeskTransaction({
    sevdeskCheckingAccountId: CheckingAccounts.TransferwiseUSD,
    ...transaction
  });
  await payment.save(sevClient);
  return payment;
}
