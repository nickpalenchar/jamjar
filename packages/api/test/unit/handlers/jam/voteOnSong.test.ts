import { allowedFields } from "../../../../src/dbhelper/allowedFields";
import { voteOnSong } from "../../../../src/handlers/jam";
import { jamDoc } from "../../../documents/jam";
import { userInJamDoc } from "../../../documents/userInJam";
import { queueSongDoc } from "../../../documents/queueSong";
import { createReq, resStub } from "../../../stubs/express";
import {
  queueSongsDelete,
  queueSongsUpdate,
  userInJamFindFirst,
} from "../../../stubs/prisma";
import httpErrors from "http-errors";

jest.mock("@prisma/client");
describe("voteOnSong", () => {
  afterEach(jest.clearAllMocks);
  it("increments the vote on a song", async () => {
    const next: any = jest.fn();
    await voteOnSong(
      createReq({
        params: {
          jamId: jamDoc.id,
          songId: queueSongDoc.id,
        },
      }),
      resStub,
      next,
    );
    expect(next).not.toHaveBeenCalled();
    expect(resStub.status).toHaveBeenCalledWith(200);
    expect(resStub.send).toHaveBeenCalledWith({
      song: allowedFields("queueSongs", { ...queueSongDoc, ...{ rank: 3 } }),
      userVibes: 1,
    });
  });

  it("decrements the vote on a song", async () => {
    const next: any = jest.fn();
    await voteOnSong(
      createReq({
        params: {
          jamId: jamDoc.id,
          songId: queueSongDoc.id,
        },
        query: {
          direction: "down",
        },
      }),
      resStub,
      next,
    );
    expect(next).not.toHaveBeenCalled();
    expect(resStub.status).toHaveBeenCalledWith(200);
    expect(resStub.send).toHaveBeenCalledWith({
      song: allowedFields("queueSongs", { ...queueSongDoc, ...{ rank: 1 } }),
      userVibes: 1,
    });
  });
  it("does not change the rank if user has no vibes", async () => {
    userInJamFindFirst.mockResolvedValueOnce({
      ...userInJamDoc,
      ...{ vibes: 0 },
    });
    const next: any = jest.fn();
    await voteOnSong(
      createReq({
        params: {
          jamId: jamDoc.id,
          songId: queueSongDoc.id,
        },
      }),
      resStub,
      next,
    );
    expect(next).not.toHaveBeenCalledWith(httpErrors.NotFound);
    expect(queueSongsUpdate).not.toHaveBeenCalled();
  });

  it("removes the song if it gets downvoted to 0", async () => {
    queueSongsUpdate.mockResolvedValue({
      ...queueSongDoc,
      ...{ rank: 0 },
    });
    const next: any = jest.fn();
    await voteOnSong(
      createReq({
        params: {
          jamId: jamDoc.id,
          songId: queueSongDoc.id,
        },
      }),
      resStub,
      next,
    );
    expect(queueSongsDelete).toHaveBeenCalledWith({
      where: {
        id: queueSongDoc.id,
      },
    });
  });
});
