import * as functions from "firebase-functions";
import { sync } from "./codementor-client";

const codementorCron = functions
  .region("europe-west1")
  .pubsub.schedule("0 */4 * * *")
  .onRun(async context => sync());

export default codementorCron;
