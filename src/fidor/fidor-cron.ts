import * as functions from "firebase-functions";
import { syncDelta } from "./fidor";

const fidorCron = functions
  .region("europe-west1")
  .runWith({ memory: "1GB" })
  .pubsub.schedule("15 */8 * * *")
  .onRun(async context => syncDelta());

export default fidorCron;
