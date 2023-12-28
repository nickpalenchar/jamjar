import { PrismaClient } from "@prisma/client";
import { Middleware, Context } from "../../middleware/types";
import httpErrors from "http-errors";
import { add } from "date-fns";
import { allowedFields } from "../../dbhelper/allowedFields";
import { generatePhrase } from "./_generatePhrase";

const prisma = new PrismaClient();

// POST /jam
export const newJam: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;

  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }
  if (context.principal.user.anon) {
    return next(httpErrors.Unauthorized());
  }
  const oldJam = await prisma.jam.findFirst({
    where: { userId: context.principal.user.id, exp: { gt: new Date() } },
  });
  if (oldJam) {
    return next(
      httpErrors.Conflict(`User already has active Jam '${oldJam.phrase}'`),
    );
  }
  let customPhrase = undefined;
  for (let i = 0; i < 5 && !customPhrase; i++) {
    const phrase = generatePhrase();
    const jamWithPhrase = await prisma.jam.findFirst({
      where: {
        phrase,
      }
    });
    if (!jamWithPhrase) {
      customPhrase = { phrase }
    }
  }
  const jam = await prisma.jam.create({
    data: {
      userId: context.principal.user.id,
      spotify: "",
      exp: add(new Date(), { hours: 6 }),
      ...customPhrase
    },
  });

  await prisma.userInJam.create({
    data: {
      userId: context.principal.user.id,
      jamId: jam.id,
    },
  });
  res.status(201).send(allowedFields("jam", jam));
};
