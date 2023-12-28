import { jamDoc } from "../documents/jam";
import { queueSongDoc } from "../documents/queueSong";
import { sessionDoc } from "../documents/session";
import { userDoc } from "../documents/user";
import { userInJamDoc } from "../documents/userInJam";

export const sessionFindFirst = jest
  .fn()
  .mockImplementation(async ({ where }: Record<string, any>) => {
    return where?.id === sessionDoc.id ? sessionDoc : null;
  });

export const userFindFirst = jest
  .fn()
  .mockImplementation(async ({ where }: Record<string, any>) => {
    return where?.id === userDoc.id ? userDoc : null;
  });

export const userInJamFindFirst = jest
  .fn()
  .mockImplementation(async ({ where }: Record<string, any>) => {
    return where?.jamId === jamDoc.id && where.userId === userDoc.id
      ? userInJamDoc
      : null;
  });
export const userInJamUpdate = jest
.fn()
.mockImplementation(async ({ where, data }) => {
  if (where.id !== userInJamDoc.id) {
    return null;
  }
  if (data.vibes?.increment) {
    return {
      ...userInJamDoc,
      ...{ vibes: userInJamDoc.vibes + 1 },
    };
  }
  if (data.rank?.decrement) {
    return {
      ...userInJamDoc,
      ...{ vibes: userInJamDoc.vibes - 1 },
    };
  }
  return userInJamDoc;
});

export const queueSongsUpdate = jest
  .fn()
  .mockImplementation(async ({ where, data }) => {
    if (where.id !== queueSongDoc.id) {
      return null;
    }
    if (data.rank?.increment) {
      return {
        ...queueSongDoc,
        ...{ rank: queueSongDoc.rank + 1 },
      };
    }
    if (data.rank?.decrement) {
      return {
        ...queueSongDoc,
        ...{ rank: queueSongDoc.rank - 1 },
      };
    }
    return queueSongDoc;
  });
