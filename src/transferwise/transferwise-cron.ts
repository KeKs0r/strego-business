import * as functions from "firebase-functions";
import { syncDelta } from "./transferwise";

const transferwiseCron = functions.pubsub
  .schedule("0 */4 * * *")
  .onRun(async context => syncDelta());

export default transferwiseCron;
