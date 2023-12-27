import { userDoc } from "../../documents/user";
import { sessionDoc } from "../../documents/session";

class PrismaClientMock {
  session = {
    findFirst: async ({ where }: Record<string, any>) => {
      return where?.id === sessionDoc.id ? sessionDoc : null;
    }
  }
  user = {
    findFirst: async ({ where }: Record<string, any>) => {
      return where?.id === userDoc.id ? userDoc : null;
    }
  };
}

export const PrismaClient = PrismaClientMock;