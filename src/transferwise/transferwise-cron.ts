import * as functions from "firebase-functions";
import { syncDelta } from "./transferwise";

const transferwiseCron = functions
  .region("europe-west1")
  .pubsub.schedule("0 */4 * * *")
  .onRun(async context => syncDelta());

export default transferwiseCron;
