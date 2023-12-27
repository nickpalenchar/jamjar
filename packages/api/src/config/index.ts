import * as t from 'io-ts';
import path from 'path';
import { readFileSync } from 'fs';

const CommonConfig = t.type({
  Env: t.keyof({
    DEV: null,
    STAGING: null,
    PROD: null,
  }),
  votingPrice: t.Int,
});
const DevConfig = t.intersection([
  CommonConfig,
  t.type({
    Env: t.literal('DEV'),
    rootKey: t.string,
  }),
]);

const Config = t.union([CommonConfig, DevConfig]);

const file = process.env.NODE_ENV ? `config.${process.env.NODE_ENV.toLowerCase()}.json` : 'config.dev.json';

const filePath = path.join(__dirname, "..", "config", file);

const fileValues: string = JSON.parse(
  readFileSync(filePath).toString(),
);
const validation = Config.decode(fileValues);

if (validation._tag === "Left") {
  throw validation.left;
}

export const config = validation.right;
