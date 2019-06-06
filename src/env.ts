import { resolve } from "path";
import { config } from "dotenv";

// console.log(process.env);
config({ path: resolve(__dirname, "../.env") });
