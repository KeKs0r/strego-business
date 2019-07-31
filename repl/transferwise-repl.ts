import {
  getTransactions,
  mapToSevdesk
} from "../src/transferwise/transferwise";

async function run() {
  try {
    const since = new Date("2019-07-15");
    const transactions = await getTransactions(since);
    console.log(JSON.stringify(transactions[1]));
    const mapped = transactions.map(mapToSevdesk);
    console.log(mapped);
  } catch (e) {
    console.error(e);
  }
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
