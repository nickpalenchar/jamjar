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

const filePath = path.join(__dirname, "..", "secrets", file);
log.info('Loading config from file.', { filePath });
const fileValues: string = JSON.parse(
  readFileSync(filePath).toString(),
);

const validation = Config.decode(fileValues);

if (validation._tag === "Left") {
  throw validation.left;
}

export const config = validation.right;
