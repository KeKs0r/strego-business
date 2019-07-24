import * as _ from "lodash";

enum TRANSACTION_TYPES {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  TRANSFER = "TRANSFER",
  CREDIT_CARD = "CREDIT_CARD"
}

export const TRANSACTION_LABELS: { [s: string]: TRANSACTION_TYPES } = {
  Gutschrift: TRANSACTION_TYPES.CREDIT,
  Lastschrift: TRANSACTION_TYPES.DEBIT,
  Überweisung: TRANSACTION_TYPES.TRANSFER,
  MasterCard: TRANSACTION_TYPES.CREDIT_CARD
};

type PluckResult = {
  rest: string;
  value?: string;
  key?: string;
  index?: number;
};

const IBAN_REGEX = /(IBAN): (\b[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?!(?:[ ]?[0-9]){3})(?:[ ]?[0-9]{1,2})?\b)/gm;
const BIC_REGEX = /(BIC): ([A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1})/gm;
const UCI_REGEX = /(UCI): \b(\w{4,35})\b/gm;
const UMR_REGEX = /(UMR): \b(\w{4,35})\b/gm;
const TYPE_PARTNER_REGEX = new RegExp(
  `(${Object.keys(TRANSACTION_LABELS).join("|")})\b\s(.*)`,
  "gm"
);
const EXCHANGE_RATE_REGEX = /\(([0-9]{0,3},[0-9]{0,6}) (EUR\/[A-Z]{3})\)/gm;
const CREDIT_CARD_PARTNER_REGEX = /bei (.+)/gm;
const EXCHANGE_FEE_REGEX = /Fremdwährungsgebühr in Höhe von ([0-9]{0,3},[0-9]{0,6}) Euro/gm;

function collect(regExp: RegExp, str: string) {
  const matches = [];
  while (true) {
    const match = regExp.exec(str);
    if (match === null) break;
    // Add capture of group 1 to `matches`
    matches.push({
      full: match[0],
      key: match[1],
      value: match[2],
      index: match.index
    });
  }
  if (matches.length > 1) {
    console.warn("I found multiple matches", str);
  }
  return matches[0];
}

function pluckRegex(regex: RegExp, input: string): PluckResult {
  const match = collect(regex, input);
  if (!match) {
    return {
      rest: input
    };
  }
  const rest = _.trim(input.replace(regex, ""));
  return {
    ...match,
    rest
  };
}

function parseBankTransaction(type: string, description: string): object {
  const partnerKey =
    type === TRANSACTION_TYPES.TRANSFER ? "Empfänger" : "Absender";
  const [transaction, partnerPart] = description.split(partnerKey);
  const fullPartnerPart = `${partnerKey}${partnerPart}`;

  const { value: iban, rest: afterIban, index: ibanIndex } = pluckRegex(
    IBAN_REGEX,
    transaction
  );

  const preIban = _.trim(transaction.substr(0, ibanIndex));
  const postIban = _.trim(afterIban.substr(ibanIndex || 0));
  const { value: partner } = pluckRegex(TYPE_PARTNER_REGEX, preIban);
  const { value: bic, rest: afterBic } = pluckRegex(
    BIC_REGEX,
    _.trim(postIban)
  );
  const { value: uci, rest: afterUCI } = pluckRegex(
    UCI_REGEX,
    _.trim(afterBic)
  );
  const { value: umr, rest: afterUMR } = pluckRegex(
    UMR_REGEX,
    _.trim(afterUCI)
  );
  const typeString = _.findKey(TRANSACTION_LABELS, t => t === type);
  const reference = _.trim(
    afterUMR.replace(typeString || "", "").replace(":", "")
  );

  const { value: partnerIban, rest: afterPartnerIban } = pluckRegex(
    IBAN_REGEX,
    fullPartnerPart
  );
  const restKeys = afterPartnerIban.split(",").map(_.trim);
  const partnerPartner = _.trim(restKeys[0].split(":")[1]);
  return {
    type,
    iban: iban || partnerIban,
    bic,
    uci,
    umr,
    partner: partner || partnerPartner,
    reference: reference || preIban
  };
}

function parseCreditCard(description: string) {
  let currentRest;
  let exchange_amount;
  const { key: exchange_rate, value: exchange_pair, rest } = pluckRegex(
    EXCHANGE_RATE_REGEX,
    description
  );

  currentRest = rest;
  if (exchange_pair) {
    const otherCurrency = exchange_pair.split("/")[1];
    const amountRegex = new RegExp(
      `\\(([0-9]{0,3},[0-9]{0,6}) ${otherCurrency}\\)`,
      "gm"
    );
    const { key: amount, rest: afterAmount } = pluckRegex(
      amountRegex,
      currentRest
    );
    exchange_amount = amount;
    currentRest = afterAmount;
  }
  const { key: partner, rest: afterPartner } = pluckRegex(
    CREDIT_CARD_PARTNER_REGEX,
    currentRest
  );
  const { key: exchange_fee } = pluckRegex(EXCHANGE_FEE_REGEX, description);
  return {
    type: TRANSACTION_TYPES.CREDIT_CARD,
    exchange_rate,
    exchange_pair,
    exchange_amount,
    exchange_fee,
    partner,
    reference: description
  };
}

export function parseDescription(description: string) {
  const typeString = description.split(" ")[0].replace(":", "");
  const type = TRANSACTION_LABELS[typeString];
  if (!type) {
    throw new Error(`Could not find Transaction Type for ${typeString}`);
  }
  if (type === TRANSACTION_TYPES.CREDIT_CARD) {
    return parseCreditCard(description);
  }
  return parseBankTransaction(type, description);
}
