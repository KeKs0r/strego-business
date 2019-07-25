import "./env";
import * as functions from "firebase-functions";
import { get } from "lodash";

export const FIDOR_USERNAME =
  get(functions.config(), "fidor.username") || process.env.FIDOR_USERNAME;

export const FIDOR_PASSWORD =
  get(functions.config(), "fidor.password") || process.env.FIDOR_PASSWORD;

export const SEVDESK_API_KEY =
  get(functions.config(), "sevdesk.api_key") || process.env.SEVDESK_API_KEY;

export const TRANSFERWISE_API_KEY =
  get(functions.config(), "transferwise.api_key") ||
  process.env.TRANSFERWISE_API_KEY;

export const CODEMENTOR_API_KEY =
  get(functions.config(), "codementor.api_key") ||
  process.env.CODEMENTOR_API_KEY;

export const RECAPTCHA_API_KEY =
  get(functions.config(), "recaptcha.api_key") || process.env.RECAPTCHA_API_KEY;

export const FIDOR_CUTOFF_DATE = "2019-07-05";
