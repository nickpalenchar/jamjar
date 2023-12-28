import { userDoc } from "../../documents/user";
import { jamDoc } from "../../documents/jam";
import { userInJamDoc } from "../../documents/userInJam";
import { sessionFindFirst } from "../../stubs/prisma";

class PrismaClientMock {
  session = {
    findFirst: sessionFindFirst,
  };
  user = {
    findFirst: async ({ where }: Record<string, any>) => {
      return where?.id === userDoc.id ? userDoc : null;
    },
  };
  userInJam = {
    findFirst: async ({ where }: Record<string, any>) => {
      return where?.jamId === jamDoc.id && where.userId === userDoc.id
        ? userInJamDoc
        : null;
    },
  };
}

export const PrismaClient = PrismaClientMock;
