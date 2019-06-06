import {
  SevdeskAccount,
  SevdeskTransaction,
  ISevdeskTransaction
} from "@mojoio/sevdesk";
import { SEVDESK_API_KEY } from "../config";
import firebase from "../service/firebase";

const db = firebase.firestore();

export enum CheckingAccounts {
  Fidor = "514502",
  TransferwiseUSD = "544237"
}

const sevdeskAccount = new SevdeskAccount(SEVDESK_API_KEY);

export async function createPayment(
  referenceId: string,
  transaction: ISevdeskTransaction,
  meta: object
) {
  const docRef = db.collection("sevdesk-payments").doc(referenceId);
  return docRef.set({
    transaction,
    meta
  });
}

export async function createPaymentFromStore(transaction: ISevdeskTransaction) {
  const payment = new SevdeskTransaction({
    sevdeskCheckingAccountId: CheckingAccounts.TransferwiseUSD,
    ...transaction
  });
  await payment.save(sevdeskAccount);
  return payment;
}
