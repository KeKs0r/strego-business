import * as puppeteer from "puppeteer-extra";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import * as StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Page } from "puppeteer-extra";
import {
  FIDOR_USERNAME,
  FIDOR_PASSWORD,
  RECAPTCHA_API_KEY
} from "../src/config";
import * as _ from "lodash";
import { parseDescription, parseAmount, parseDate } from "../src/fidor/parser";

const recaptchaPlugin = RecaptchaPlugin({
  provider: { id: "2captcha", token: RECAPTCHA_API_KEY }
});
const stealthPlugin = StealthPlugin();

async function run() {
  const page = await start();
  await login(page);
  await extractTransactions(page);
}

function getRawTransactions() {
  var rows = Array.from(
    document.querySelectorAll("table#booked-transactions tbody tr")
  );
  var data = rows
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

async function start(): Promise<Page> {
  puppeteer.use(recaptchaPlugin);
  puppeteer.use(stealthPlugin);
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  const page = await browser.newPage();
  await page.goto("https://banking.fidor.de/login");
  return page;
}

async function login(page: Page) {
  console.log(FIDOR_USERNAME, FIDOR_PASSWORD);
  await page.type("#user_email", FIDOR_USERNAME);
  await page.type("#user_password", FIDOR_PASSWORD);
  await page.click("#login");

  await page.solveRecaptchas();

  await page.waitForNavigation({ timeout: 10 * 1000 });
  console.log("Logged In");
}

async function extractTransactions(page: Page) {
  await page.goto("https://banking.fidor.de/smart-account/transactions");
  console.log("Navigated to Transactions");
  const rawTransactions = await page.evaluate(getRawTransactions);
  const transactions = rawTransactions.map(raw => ({
    amount: parseAmount(raw.amount),
    date: parseDate(raw.date),
    ...parseDescription(raw.description)
  }));
  console.log(transactions);
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
