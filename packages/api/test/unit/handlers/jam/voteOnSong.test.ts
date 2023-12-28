jest.mock("@prisma/client");
import { allowedFields } from "../../../../src/dbhelper/allowedFields";
import { voteOnSong } from "../../../../src/handlers/jam";
import { jamDoc } from "../../../documents/jam";
import { queueSongDoc } from "../../../documents/queueSong";
import { createReq, resStub } from "../../../stubs/express";

describe("voteOnSong", () => {
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
});
