// tslint:disable:no-unused-variable
import * as sevdesk from "@mojoio/sevdesk";
import { SEVDESK_API_KEY } from "../src/config";
import { CheckingAccounts } from "../src/sevdesk/sevdesk-config";
import * as _ from "lodash";
import { json2formdatastring } from "../src/sevdesk/util/build-formdata";
import { Invoice, TaxRate, Unit, Currency } from "../src/sevdesk/invoice-model";
// import SevdeskClient from "../src/sevdesk/sevdesk-client";
import * as got from "got";
import { getNextNumber } from "../src/sevdesk/invoice-api";

const sevdeskAccount = new sevdesk.SevdeskAccount(SEVDESK_API_KEY);

// const FidorCheckingAccount = "514502";
// const TransferWiseUSDCheckingAccount = "544237";

async function createTransferwise() {
  return;
  const sevdeskCheckingAccount = new sevdesk.SevdeskCheckingAccount({
    currency: "USD",
    name: "Transferwise USD",
    transactions: []
  });

  // NOTE: .save() will get the sevdeskId and store it in the instance at .sevdeskId !
  // this is the default behaviour for all classes that can be `.save()`ed to sevdesk !
  await sevdeskCheckingAccount.save(sevdeskAccount);
  console.log(sevdeskCheckingAccount.sevdeskId);
}

async function createTransaction() {
  return;
  const transaction = new sevdesk.SevdeskTransaction({
    sevdeskCheckingAccountId: CheckingAccounts.TransferwiseUSD,
    payeeName: "Max Mustermann",
    amount: 100,
    date: new Date(),
    status: "unpaid",
    description: "a cool description"
  });
  await transaction.save(sevdeskAccount);
}

async function createInvoice() {
  const invoice = new Invoice({
    currency: Currency.USD,
    invoiceDate: new Date("2019-10-20"),
    contactId: 9858279,
    contactPersonId: 274224,
    taxRate: TaxRate.NOTEU,
    positions: [
      {
        name: "Position 1",

        price: 29.99,
        quantity: 3,
        unit: Unit.HOURS
      }
    ]
  });
  invoice.addPosition({
    name: "Position 2",
    price: 15,
    quantity: 4.34,
    unit: Unit.HOURS
  });
  invoice.setInvoiceNumber("IN-19-9999");
  /*
  const invoicePos = [
    {
      objectName: "InvoicePos",
      name: "Position 1",
      quantity: 2,
      price: 30,
      taxRate: 0,
      unity: {
        id: 9, // Stunden
        objectName: "Unity"
      },
      mapAll: true
    }
    // {
    //   name: "Position 2",
    //   quantity: 2.4,
    //   price: 80,
    //   unity: {
    //     id: 9, // Stunden
    //     objectName: "Unity"
    //   }
    // }
  ];
  */

  const body = invoice.serialize();
  // console.log(JSON.stringify(body, null, 2));

  const formBody = json2formdatastring(body);
  return;
  // console.log(formBody);

  const response = await got.post(`/Invoice/Factory/saveInvoice`, {
    // json: true,
    baseUrl: "https://my.sevdesk.de/api/v1/",
    headers: {
      Authorization: SEVDESK_API_KEY,
      Accept: "application/json",
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formBody
  });

  try {
    console.log(JSON.stringify(JSON.parse(response.body), null, 2));
  } catch (e) {}
}

async function getInvoices() {
  const invoiceId = "7487101";
  //deliveryDate: '2019-02-01T00:00:00+01:00',
  //deliveryDateUntil: '2019-02-28T23:59:56+01:00',
  const response = await sevdeskAccount.request("GET", "/Invoice");
  const invoices = response.objects;
  console.log("IDS", _.map(invoices, "id"));
  console.log(
    response.objects.filter((i: { id: string }) => i.id === invoiceId)
  );
  // const updateResponse = await sevdeskAccount.request(
  //   "PUT",
  //   `/Invoice/${original}`,
  //   JSON.stringify({
  //     deliveryDate: "2019-02-01T00:00:00+01:00",
  //     deliveryDateUntil: "2019-02-28T23:59:56+01:00"
  //   })
  // );
  // console.log(updateResponse);
}

async function checkAcount() {
  return;
  // const sevdeskCheckingAccount = await sevdesk.SevdeskCheckingAccount.getCheckingAccountByName(
  //   sevdeskAccount,
  //   "Transferwise USD"
  // );

  const response = await sevdeskAccount.request(
    "GET",
    "/CheckAccountTransaction"
  );
  const apiObjectArray = response.objects;
  const twTransactions = apiObjectArray.filter(
    (t: { checkAccount: { id: string } }) => t.checkAccount.id === "544237"
  );

  /*
  const updateAll = twTransactions.map((t: { id: any }) => {
    // tslint:disable-next-line: no-floating-promises
    sevdeskAccount.request("PUT", `/CheckAccountTransaction/${t.id}`, {
      status: "100"
    });
  });
 
  await Promise.all(updateAll);
   */
  console.log(twTransactions[0]);
}

async function getNext() {
  const res = await getNextNumber();
  console.log(res);
}

async function run() {
  try {
    await getNext();
    // await createTransaction();
    // await checkAcount();
    // await createTransferwise();
    // await getInvoices();
    // console.log("pre");
    // await createInvoice();
    // console.log("post");
  } catch (e) {
    console.error(e);
  }
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
