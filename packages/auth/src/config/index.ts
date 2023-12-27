import * as t from "io-ts";
import path from "path";
import { readFileSync } from "fs";

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

const fileValues: string = JSON.parse(
  readFileSync(path.join(__dirname, "..", "..", "secrets", file)).toString(),
);

const validation = Config.decode(fileValues);

if (validation._tag === "Left") {
  throw validation.left;
}

export const config = validation.right;
