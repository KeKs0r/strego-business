import sevClient, { jsonClient } from "./sevdesk-client";
import { Invoice, InvoiceType } from "./invoice-model";
import { json2formdatastring } from "./util/build-formdata";
import * as functions from "firebase-functions";
import { pickBy } from "lodash";

import firebase from "../service/firebase";
const db = firebase.firestore();

export async function getNextNumber(invoiceType = InvoiceType.RE) {
  const result = await jsonClient.get("/Invoice/Factory/getNextInvoiceNumber/");
  return result.body.objects;
}

async function createInvoice(invoice: Invoice) {
  const body = invoice.serialize();
  const formBody = json2formdatastring(body);
  // console.log(JSON.stringify(body, null, 2));

  try {
    const response = await sevClient.post(`/Invoice/Factory/saveInvoice`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formBody
    });

    return response.body;
  } catch (e) {
    console.error(e);
    if (e.body) {
      console.log(e.body);
    }
    return null;
  }
}

function clean(data: Object) {
  return pickBy(data, a => a !== undefined);
}

export async function createInvoiceWithKey(
  key: string,
  invoice: Invoice,
  meta: any
) {
  const docRef = db.collection("sevdesk-invoice").doc(key);
  return docRef.set({
    invoice: clean(invoice.toInput()),
    meta
  });
}

export const onInvoiceCreate = functions
  .region("europe-west1")
  .firestore.document("sevdesk-invoice/{referenceId}")
  .onCreate(async (snap, context) => {
    const invoiceData = snap.get("invoice");
    const invoice = new Invoice(invoiceData);
    console.log("Creating Invoice", invoiceData);
    const invoiceNr = await getNextNumber();
    console.log("Next InvoiceNr", invoiceNr);
    invoice.setInvoiceNumber(invoiceNr);
    const createdInvoice = await createInvoice(invoice);
    console.log("created", createdInvoice);
  });
