import * as functions from "firebase-functions";
import { createPaymentFromStore } from "./sevdesk";

const onPaymentCreate = functions.firestore
  .document("sevdesk-payments/{referenceId}")
  .onCreate(async (snap, context) => {
    const transaction = snap.get("transaction");
    console.log("Creating Transaction", transaction);
    const createdPayment = await createPaymentFromStore(transaction);
    console.log("created", createdPayment);
  });

export default onPaymentCreate;
