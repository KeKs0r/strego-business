import * as functions from "firebase-functions";
import { createPaymentFromStore } from "./sevdesk";

const onPaymentCreate = functions
  .region("europe-west1")
  .firestore.document("sevdesk-payments/{referenceId}")
  .onCreate(async (snap, context) => {
    const transaction = snap.get("transaction");
    const account = snap.get("account");
    console.log("Creating Transaction", transaction);
    const createdPayment = await createPaymentFromStore(account, transaction);
    console.log("created", createdPayment);
  });

export default onPaymentCreate;
