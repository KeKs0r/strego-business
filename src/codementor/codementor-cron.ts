import * as functions from "firebase-functions";
import { sync } from "./codementor-client";

const codementorCron = functions.pubsub
  .schedule("0 */4 * * *")
  .onRun(async context => sync());

export default codementorCron;
