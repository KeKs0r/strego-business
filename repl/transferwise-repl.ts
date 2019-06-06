import { getTransactions } from "../src/transferwise/transferwise";

async function run() {
  try {
    return;
    const transactions = await getTransactions(new Date());
    console.log(transactions);
  } catch (e) {
    console.error(e);
  }
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
