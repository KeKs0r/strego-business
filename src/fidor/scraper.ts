import { launch, Page } from "puppeteer";
import { FIDOR_USERNAME, FIDOR_PASSWORD } from "../config";

async function run() {
  const page = await start();
  await login(page);
}

async function start(): Promise<Page> {
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto("https://banking.fidor.de/login");
  return page;
}

async function login(page: Page) {
  console.log(FIDOR_USERNAME, FIDOR_PASSWORD);
  await page.type("#user_email", FIDOR_USERNAME);
  await page.type("#user_password", FIDOR_PASSWORD);
  await page.click("#login");

  await page.waitForNavigation();

  console.log("New Page URL:", page.url());
}

run()
  .then(() => console.log("Done"))
  .catch(console.error);
