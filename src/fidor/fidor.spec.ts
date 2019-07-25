import { getKeyForTransaction } from "./fidor";
import { FidorTransaction } from "./fidor-model";

describe("getKeyForTransaction", () => {
  it("Generates Key", () => {
    const t = {
      amount: 22.02,
      description: `Gutschrift Finanzamt Weinheim (Finanzkasse) IBAN: DE72660000000067001502 BIC: MARKDEF1660 ERSTATT.47020/31876 UMS.ST JUN.19 22,02 EUR

Absender: Finanzamt Weinheim (Finanzkasse), IBAN: DE72660000000067001502, BIC: MARKDEF1660`,
      date: new Date("12.07.2019")
    } as FidorTransaction;
    const hash = getKeyForTransaction(t);
    console.log(hash);
  });
});
