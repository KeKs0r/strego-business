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
  if (true) {
    return true;
  }
  const sevdeskCheckingAccount = await sevdesk.SevdeskCheckingAccount.getCheckingAccountByName(
    sevdeskAccount,
    "Transferwise USD"
  );
  sevdeskAccount;
  console.log(sevdeskCheckingAccount);
}

async function run() {
  await createTransaction();
  await checkAcount();
  await createTransferwise();
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
