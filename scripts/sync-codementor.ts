import { sync } from "../src/codementor/codementor-client";

async function run() {
  try {
    const start = new Date(2019, 5);
    const synced = await sync(start);
    console.log(synced);
  } catch (e) {
    console.error(e);
  }
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
