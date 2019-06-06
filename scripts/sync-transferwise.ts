import { syncDelta } from "../src/transferwise/transferwise";

async function run() {
  try {
    const start = new Date(2019, 1);
    const synced = await syncDelta(start);
    console.log(synced);
  } catch (e) {
    console.error(e);
  }
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
