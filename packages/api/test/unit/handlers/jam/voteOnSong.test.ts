jest.mock("@prisma/client");

import { PrismaClient } from "@prisma/client";

describe("voteOnSong", () => {
  it("increments the vote on a song", async () => {
    const prisma = new PrismaClient();
    const session = await prisma.session.findFirst({
      where: {
        id: "bkeoxkr98r",
      },
    });
    console.log(session);
  });
});
