import * as got from "got";
import { SEVDESK_API_KEY } from "../config";

export const client = got.extend({
  // json: true,
  baseUrl: "https://my.sevdesk.de/api/v1/",
  headers: {
    Authorization: SEVDESK_API_KEY,
    accept: "application/json",
    "cache-control": "no-cache"
  }
});

export const jsonClient = got.extend({
  json: true,
  baseUrl: "https://my.sevdesk.de/api/v1/",
  headers: {
    Authorization: SEVDESK_API_KEY,
    accept: "application/json",
    "cache-control": "no-cache"
  }
});

export default client;
