import * as got from "got";
import { CODEMENTOR_API_KEY } from "../config";
import { Invoice, Currency, Unit, TaxRate } from "../sevdesk/invoice-model";
import { createInvoiceWithKey } from "../sevdesk/invoice-api";
import { lightFormat, subHours } from "date-fns";
import { groupBy, map, sortBy, head, last, size } from "lodash";

const client = got.extend({
  json: true,
  baseUrl: "https://dev.codementor.io/api/",
  headers: {
    "x-codementor-api-key": CODEMENTOR_API_KEY
  }
});

enum PaymentType {
  SESSION = "SESSION",
  DIRECT = "DIRECT"
}

type Payout = {
  paid_at: string;
  client: {
    name: string;
  };
  payment_type: PaymentType;
  created_at: string;
  gross_amount: string;
  platform_fee: string;
  payout_amount: string;
};

export async function getPayoutsForMonth(date?: Date): Promise<Array<Payout>> {
  const month = lightFormat(date || new Date(), "yyyy-MM");
  const resp = await client.get(
    `/payouts/monthly-payouts?payout_month=${month}`
  );
  return resp.body;
}

const codeMentorContact = 9858279;
const myselfUser = 274224;

function parseDate(d: string) {
  return new Date(parseInt(d) * 1000);
}

function mapPayoutsToSevdesk(payouts: Array<Payout>): Array<Invoice> {
  const grouped = groupBy(payouts, "paid_at");
  return map(grouped, (positions, key) => {
    const sortedPos: Array<Payout> = sortBy(positions, "created_at");
    const date = parseDate(key);
    const deliveries = map(positions, p => parseDate(p.created_at));
    const invoice = new Invoice({
      currency: Currency.USD,
      contactId: codeMentorContact,
      contactPersonId: myselfUser,
      invoiceDate: date,
      reference: `Codementor: ${lightFormat(parseDate(key), "dd.MM.yy")}`,
      taxRate: TaxRate.NOTEU,
      deliveryDate: head(deliveries),
      deliveryDateUntil: last(deliveries),
      positions: sortedPos.map(pos => ({
        name: `${pos.client.name} (${lightFormat(
          parseDate(pos.created_at),
          "dd.MM.yy"
        )})`,
        quantity: 1,
        price: parseFloat(pos.payout_amount),
        unit: Unit.BLANKET
      }))
    });
    return invoice;
  });
}

export async function sync(date: Date = subHours(new Date(), 4)) {
  const payouts = await getPayoutsForMonth(date);
  const invoices = mapPayoutsToSevdesk(payouts);
  return Promise.all(
    invoices.map(i => createInvoiceWithKey(i.reference as string, i, payouts))
  );
}
