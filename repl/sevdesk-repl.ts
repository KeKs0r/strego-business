import * as sevdesk from "@mojoio/sevdesk";
import { SEVDESK_API_KEY } from "../src/config";
import { CheckingAccounts } from "../src/sevdesk/sevdesk";

const sevdeskAccount = new sevdesk.SevdeskAccount(SEVDESK_API_KEY);

// const FidorCheckingAccount = "514502";
// const TransferWiseUSDCheckingAccount = "544237";

async function createTransferwise() {
  if (true) {
    return;
  }
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
  if (true) {
    return;
  }
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

async function checkAcount() {
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
  const updateAll = twTransactions.map((t: { id: any }) => {
    // tslint:disable-next-line: no-floating-promises
    sevdeskAccount.request("PUT", `/CheckAccountTransaction/${t.id}`, {
      status: "100"
    });
  });
  await Promise.all(updateAll);
  // console.log(apiObjectArray);
  // return;
  console.log();
  // return [];
}

async function run() {
  await createTransaction();
  await checkAcount();
  await createTransferwise();
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
