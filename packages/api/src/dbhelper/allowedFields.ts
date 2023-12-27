import { PrismaClient } from "@prisma/client";
import { config } from "../config";

interface FieldSpec {
  // allowed literal fields
  fields: string[];
  // rename fields
  fieldMappings?: Record<string, string>;
}

const allowedFieldsConfig: Partial<Record<keyof PrismaClient, FieldSpec>> = {
  jam: {
    fields: ["id", "phrase", "exp"],
  },
  queueSongs: {
    fields: ["id", "rank", "imageUrl", "name", "artist", "spotifyUri"],
  },
};

export const allowedFields = (
  documentType: keyof PrismaClient,
  document: Record<string, any>,
) => {
  const result: any = {};
  // In Dev environment ONLY, all fields may be returned.
  if (config.Env === "DEV") {
    result.$dev = document;
  }

  if (!allowedFieldsConfig[documentType]) {
    return result;
  }
  const docMap = allowedFieldsConfig[documentType];
  for (const key of docMap.fields) {
    if (docMap.fieldMappings?.[key]) {
      result[docMap.fieldMappings[key]] = document[key];
    } else {
      result[key] = document[key] ?? null;
    }
  }
  return result;
};
