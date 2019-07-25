import { parseDescription, parseAmount, parseDate } from "./parser";

describe("Fidor Parser", () => {
  describe("Parse Description", () => {
    describe("Gutschrift", () => {
      it("Parses Gutschrift", () => {
        const d = `Gutschrift Finanzamt Weinheim (Finanzkasse) IBAN: DE72660000000067001502 BIC: MARKDEF1660 ERSTATT.47020/31876 UMS.ST JUN.19 22,02 EUR

Absender: Finanzamt Weinheim (Finanzkasse), IBAN: DE72660000000067001502, BIC: MARKDEF1660`;
        const parsed = parseDescription(d);
        expect(parsed).toHaveProperty("type", "CREDIT");
        expect(parsed).toHaveProperty(
          "partner",
          "Finanzamt Weinheim (Finanzkasse)"
        );
        expect(parsed).toHaveProperty("iban", "DE72660000000067001502");
        expect(parsed).toHaveProperty("bic", "MARKDEF1660");
        expect(parsed).toHaveProperty(
          "reference",
          "ERSTATT.47020/31876 UMS.ST JUN.19 22,02 EUR"
        );
      });

      it("Gutschrift without Reference", () => {
        const d = `Gutschrift Yoloa GmbH IBAN: DE78700202700020057852 BIC: HYVEDEMMXXX

Absender: Yoloa GmbH, IBAN: DE78700202700020057852, BIC: HYVEDEMMXXX`;
        const parsed = parseDescription(d);
        expect(parsed).toHaveProperty("reference", "Gutschrift Yoloa GmbH");
        expect(parsed).toHaveProperty("partner", "Yoloa GmbH");
      });

      it("Gutschrift with Verwendungszweck", () => {
        const d = `Gutschrift Rafael Jose Aviles Escobar IBAN: DE34100700240016470700 BIC: DEUTDEDBBER Rechnung Nr. IN-19-1001

Absender: Rafael Jose Aviles Escobar, IBAN: DE34100700240016470700, BIC: DEUTDEDBBER`;
        const parsed = parseDescription(d);
        expect(parsed).toHaveProperty("reference", "Rechnung Nr. IN-19-1001");
        expect(parsed).toHaveProperty("partner", "Rafael Jose Aviles Escobar");
      });
    });

    describe("Lastschrift", () => {
      it("Parses Lastschrift", () => {
        const d = `Lastschrift Factory Works GmbH IBAN: DE89700111104107387027 BIC: DEKTDE7GXXX FACTORY BERLIN UCI: DE57ZZZ00001898203 UMR: TITC81RDYTACNMQT

Absender: Factory Works GmbH, IBAN: DE89700111104107387027, BIC: DEKTDE7GXXX`;
        const parsed = parseDescription(d);
        expect(parsed).toHaveProperty("type", "DEBIT");
        expect(parsed).toHaveProperty("partner", "Factory Works GmbH");
        expect(parsed).toHaveProperty("iban", "DE89700111104107387027");
        expect(parsed).toHaveProperty("bic", "DEKTDE7GXXX");
        expect(parsed).toHaveProperty("uci", "DE57ZZZ00001898203");
        expect(parsed).toHaveProperty("umr", "TITC81RDYTACNMQT");
        expect(parsed).toHaveProperty("reference", "FACTORY BERLIN");
      });
    });

    describe("Überweisung", () => {
      it("Parses Überweisung", () => {
        const d = `Überweisung: Darlehen Rueckzahlung

Empfänger: Marc Hoeffl, IBAN: DE81100110012625576896
mTAN: 6PLYKK, 02.07.2019 15:19`;
        const parsed = parseDescription(d);
        expect(parsed).toHaveProperty("type", "TRANSFER");
        expect(parsed).toHaveProperty("reference", "Darlehen Rueckzahlung");
        expect(parsed).toHaveProperty("partner", "Marc Hoeffl");
        expect(parsed).toHaveProperty("iban", "DE81100110012625576896");
      });
    });

    describe("Mastercard", () => {
      it("Parses Mastercard Transaction", () => {
        const d = `MasterCard Onlinekauf (15,00 USD) bei NOTION.SO (0,8795 EUR/USD)`;
        const parsed = parseDescription(d);
        expect(parsed).toHaveProperty("type", "CREDIT_CARD");
        expect(parsed).toHaveProperty("exchange_pair", "EUR/USD");
        expect(parsed).toHaveProperty("exchange_rate", 0.8795);
        expect(parsed).toHaveProperty("exchange_amount", 15);
        expect(parsed).toHaveProperty("reference", d);
        expect(parsed).toHaveProperty("partner", "NOTION.SO");
      });

      it("Parses Mastercard Transaction Fee", () => {
        const d = `MasterCard Fremdwährungsgebühr in Höhe von 0,20 Euro`;
        const parsed = parseDescription(d);

        expect(parsed).toHaveProperty("type", "CREDIT_CARD");
        expect(parsed).toHaveProperty("exchange_fee", 0.2);
        expect(parsed).toHaveProperty(
          "reference",
          "MasterCard Fremdwährungsgebühr in Höhe von 0,20 Euro"
        );
      });
    });
  });

  describe("Parse Amount", () => {
    it("Parses positive Amount", () => {
      expect(parseAmount("22,02 €")).toEqual(22.02);
    });
    it("Parses negative number", () => {
      expect(parseAmount("-119,00 €")).toEqual(-119);
    });
    it("Parses over thousand numbers", () => {
      expect(parseAmount("-1.000,00 €")).toEqual(-1000);
    });
  });

  describe("Parse Date", () => {
    it("Parses date", () => {
      const d = parseDate("12.07.2019");
      expect(d.getFullYear()).toEqual(2019);
      expect(d.getMonth()).toEqual(6);
      expect(d.getDate()).toEqual(12);
    });
  });
});
