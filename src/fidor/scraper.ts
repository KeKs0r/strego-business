import * as puppeteer from "puppeteer-extra";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import * as StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
  FIDOR_USERNAME,
  FIDOR_PASSWORD,
  RECAPTCHA_API_KEY,
  FIDOR_CUTOFF_DATE
} from "../config";
import * as _ from "lodash";
import { parseDescription, parseAmount, parseDate } from "./parser";
import { FidorTransaction } from "./fidor-model";

const recaptchaPlugin = RecaptchaPlugin({
  provider: { id: "2captcha", token: RECAPTCHA_API_KEY }
});
const stealthPlugin = StealthPlugin();

function getRawTransactions() {
  const rows = Array.from(
    document.querySelectorAll("table#booked-transactions tbody tr")
  );
  const data = rows
    .map(row => Array.from(row.querySelectorAll("td")).map(td => td.innerText))
    .map(row => {
      const [date, description, amount] = row;
      return {
        date,
        description,
        amount
      };
    });
  return data;
}

async function start(): Promise<puppeteer.Page> {
  puppeteer.use(recaptchaPlugin);
  puppeteer.use(stealthPlugin);
  const browser = await puppeteer.launch({
    // headless: false,
    // defaultViewport: null
  });
  const page = await browser.newPage();
  await page.goto("https://banking.fidor.de/login");
  return page;
}

async function login(page: puppeteer.Page) {
  await page.type("#user_email", FIDOR_USERNAME);
  await page.type("#user_password", FIDOR_PASSWORD);
  await page.click("#login");

  await page.solveRecaptchas();

  await page.waitForNavigation({ timeout: 10 * 1000 });
  console.log("Logged In");
}

async function extractTransactions(
  page: puppeteer.Page
): Promise<Array<FidorTransaction>> {
  await page.goto("https://banking.fidor.de/smart-account/transactions");
  console.log("Navigated to Transactions");
  const rawTransactions = await page.evaluate(getRawTransactions);
  const transactions = rawTransactions.map(raw => ({
    amount: parseAmount(raw.amount) as number,
    date: parseDate(raw.date),
    ...parseDescription(raw.description)
  }));
  console.log(transactions);
  return transactions;
}

export default async function scrapeFidor(): Promise<Array<FidorTransaction>> {
  const page = await start();
  await login(page);
  const transactions = await extractTransactions(page);
  console.log(transactions);
  const filtered = transactions.filter(
    t => t.date.getTime() > new Date(FIDOR_CUTOFF_DATE).getTime()
  );
  console.log(
    "allCount",
    transactions.length,
    "filteredCount",
    filtered.length
  );
  return filtered;
}
