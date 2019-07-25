import * as functions from "firebase-functions";
import { syncDelta } from "./fidor";

const fidorCron = functions.pubsub
  .schedule("15 */8 * * *")
  .onRun(async context => syncDelta());

export default fidorCron;
