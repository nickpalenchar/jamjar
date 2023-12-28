import {
  queueSongsUpdate,
  sessionFindFirst,
  userFindFirst,
  userInJamFindFirst,
  userInJamUpdate,
} from "../../stubs/prisma";

class PrismaClientMock {
  session = {
    findFirst: sessionFindFirst,
  };
  user = {
    findFirst: userFindFirst,
  };
  userInJam = {
    findFirst: userInJamFindFirst,
    update: userInJamUpdate,
  };
  queueSongs = {
    update: queueSongsUpdate
  }
}

export const PrismaClient = PrismaClientMock;
