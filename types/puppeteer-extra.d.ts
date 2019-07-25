declare module "puppeteer-extra" {
  import { Page as PuppeteerPage } from "puppeteer";
  export function use(input: any): any;
  export function launch(input: any): any;
  export interface Page extends PuppeteerPage {
    solveRecaptchas(): Promise<any>;
  }
}
declare module "puppeteer-extra-plugin-recaptcha";
declare module "puppeteer-extra-plugin-stealth";
