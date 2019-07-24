import { getPayoutsForMonth } from "../src/codementor/codementor-client";
import { groupBy } from "lodash";

async function run() {
  // tslint:disable-next-line: no-void-expression
  const payouts = await getPayoutsForMonth(new Date(2019, 4));

  console.log(groupBy(payouts, "paid_at"));
}

run();
