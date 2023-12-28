import { sessionDoc } from "../documents/session";

export const sessionFindFirst = jest
  .fn()
  .mockImplementation(async ({ where }: Record<string, any>) => {
    return where?.id === sessionDoc.id ? sessionDoc : null;
  });
