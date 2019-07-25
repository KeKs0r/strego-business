import { syncDelta } from "../src/fidor/fidor";

async function run() {
  try {
    const synced = await syncDelta();
    console.log(synced);
  } catch (e) {
    console.error(e);
  }
}

run()
  .then(() => console.log("Done"))
  .then(() => process.exit())
  .catch(console.error);
