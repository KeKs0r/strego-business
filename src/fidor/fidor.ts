import scrapeFidor from "./scraper";
import { FidorTransaction } from "./fidor-model";
import { createPayment, ICheckAccountTransaction } from "../sevdesk/sevdesk";
import { lightFormat } from "date-fns";
import { createHash } from "crypto";

export function mapToSevdesk(t: FidorTransaction): ICheckAccountTransaction {
  return {
    payeeName: t.partner,
    amount: t.amount,
    date: t.date,
    status: "unpaid",
    description: t.reference,
    additionalInformation: t.description
  };
}

export function getKeyForTransaction(t: FidorTransaction): string {
  const datePart = lightFormat(t.date, "dd.MM.yyyy");
  const descHash = createHash("md5")
    .update(t.description + t.amount)
    .digest("hex");
  return `${datePart}-${descHash}`;
}

export async function syncDelta() {
  const transactions = await scrapeFidor();
  const tasks = transactions.map(t => {
    const key = getKeyForTransaction(t);
    return createPayment(key, mapToSevdesk(t), t);
  });
  return Promise.all(tasks);
}
