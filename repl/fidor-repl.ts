import { launch, Page } from "puppeteer";
import { FIDOR_USERNAME, FIDOR_PASSWORD } from "../src/config";
import { default as _ } from "lodash";

const RECAPTCHA_SELECTOR = "g-recaptcha";

async function run() {
  const page = await start();
  await login(page);
}

async function hasCaptcha(page: Page) {
  try {
    await page.waitForSelector(RECAPTCHA_SELECTOR, { timeout: 1000 });
    return true;
  } catch (e) {
    return false;
  }
}

function getTransactions() {
  var rows = Array.from(
    document.querySelectorAll("table#booked-transactions tbody tr")
  );
  var data = rows
    .map(row => Array.from(row.querySelectorAll("td")).map(td => td.innerText))
    .map(row => {
      const [date, description, amount] = row;
      return {
        date: new Date(date)
      };
    });
  console.log(data);
}

async function start(): Promise<Page> {
  const browser = await launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.goto("https://banking.fidor.de/login");
  const hasRecaptcha = await hasCaptcha(page);
  if (hasRecaptcha) {
    console.log("Has recaptcha");
  }
  return page;
}

async function login(page: Page) {
  console.log(FIDOR_USERNAME, FIDOR_PASSWORD);
  await page.type("#user_email", FIDOR_USERNAME);
  await page.type("#user_password", FIDOR_PASSWORD);
  await page.click("#login");

  const hasRecaptcha = await hasCaptcha(page);
  if (hasRecaptcha) {
    console.log("Has recaptcha");
  }

  await page.waitForNavigation({ timeout: 60 * 1000 });
  await page.goto(
    "https://banking.fidor.de/corporate/smart-account/transactions"
  );

  console.log("New Page URL:", page.url());
}

// run()
//   .then(() => console.log("Done"))
//   .catch(console.error);
