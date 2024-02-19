import { PrismaClient } from "@prisma/client";
import { config } from "../config";
import { add } from "date-fns";
import crypto from "node:crypto";

const prisma = new PrismaClient();
const key = crypto
  .createHash("sha256")
  .update(String(config.SecretsKey))
  .digest("base64")
  .substring(0, 32);

interface Vault {
  get: (id: string) => Promise<string | null>;
  save: (
    value: string,
    { id, exp }: { id?: string; exp?: Date },
  ) => Promise<string>;
}

const encrypt = async (input: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  const encrypted = cipher.update(input, "utf-8", "hex") + cipher.final("hex");
  return { value: encrypted, iv };
};

const decrypt = async (input: string, iv: Buffer) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  const decrypted =
    decipher.update(input, "hex", "utf-8") + decipher.final("utf-8");
  return decrypted;
};

export const vault: Vault = {
  async get(key) {
    const secret = await prisma.secrets.findFirst({
      where: { id: key },
    });
    if (!secret) {
      return null;
    }
    return decrypt(secret.encryptedValue, secret.iv);
  },
  /** Returns id which can also be used for referencing */
  async save(value, { id, exp = add(new Date(), { days: 30 }) }) {
    const { value: encrypted, iv } = await encrypt(value);
    const secret = await prisma.secrets.create({
      data: {
        encryptedValue: encrypted,
        iv,
        ...(id && { id }),
        exp,
      },
    });
    return secret.id;
  },
};
