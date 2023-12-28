import * as t from "io-ts";
import path from "path";
import { readFileSync } from "fs";
import { getLogger } from "../logging";

const log = getLogger();

const CommonConfig = t.type({
  Env: t.keyof({
    DEV: null,
    STAGING: null,
    PROD: null,
    TEST: null,
  }),
  DEPENDENCY_API: t.string,
});

const Config = CommonConfig;

const file = process.env.NODE_ENV
  ? `config.${process.env.NODE_ENV.toLowerCase()}.json`
  : "config.prod.json";

const filePathFromDist = path.join(__dirname, "..", "config", file);
const filePathFromSrc = path.join(__dirname, "..", "..", "config", file);

let fileValues;
try {
  fileValues = JSON.parse(readFileSync(filePathFromDist).toString());
} catch (e) {
  fileValues = JSON.parse(readFileSync(filePathFromSrc).toString());
}

const validation = Config.decode(fileValues);

if (validation._tag === "Left") {
  throw validation.left;
}

export const config = validation.right;
