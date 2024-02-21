import { PrismaClient } from "@prisma/client";
import { add } from "date-fns";
import crypto from "node:crypto";

const prisma = new PrismaClient();

export class Vault {
  #key: string;

  constructor(key: string) {
    this.#key = crypto
      .createHash("sha256")
      .update(String(key))
      .digest("base64")
      .substring(0, 32);
  }

  async #encrypt(input: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.#key),
      iv,
    );
    const encrypted =
      cipher.update(input, "utf-8", "hex") + cipher.final("hex");
    return { value: encrypted, iv };
  }

  async #decrypt(input: string, iv: Buffer) {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.#key),
      iv,
    );
    const decrypted =
      decipher.update(input, "hex", "utf-8") + decipher.final("utf-8");
    return decrypted;
  }

  async get(key?: string) {
    if (!key) {
      return null;
    }
    const secret = await prisma.secrets.findFirst({
      where: { id: key },
    });
    if (!secret) {
      return null;
    }
    return this.#decrypt(secret.encryptedValue, secret.iv);
  }
  async save(
    value: string,
    {
      id,
      exp = add(new Date(), { days: 30 }),
      overwrite = false,
    }: { id?: string; exp?: Date; overwrite?: boolean },
  ) {
    const { value: encrypted, iv } = await this.#encrypt(value);
    const secret = overwrite
      ? await prisma.secrets.upsert({
          where: { id: id ?? crypto.randomBytes(16).toString("hex") },
          update: {
            iv,
            encryptedValue: encrypted,
            exp,
          },
          create: {
            iv,
            encryptedValue: encrypted,
            exp,
            ...(id && { id }),
          },
        })
      : await prisma.secrets.create({
          data: {
            encryptedValue: encrypted,
            iv,
            ...(id && { id }),
            exp,
          },
        });
    return secret.id;
  }
}
