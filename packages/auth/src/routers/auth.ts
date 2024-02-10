import { Router } from "express";
import { add } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { getLogger } from "../logging";

const USER_COOKIE = "jivesession";
const prisma = new PrismaClient();
export const authRouter = Router();

const log = getLogger();

/**
 * Finds the user based on the browser cookie.
 */
authRouter.get("/me", async (req, res) => {
  const { [USER_COOKIE]: userCookie } = req.cookies;
  if (!userCookie) {
    return res.status(401).send();
  }
  const session = await prisma.session.findFirst({
    where: {
      id: userCookie,
    },
  });
  if (!session) {
    return res.status(401).send();
  }
  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
    },
  });
  const jam = await prisma.userInJam.findFirst({
    where: { userId: session.userId },
  });
  if (!user) {
    return res.status(401).send();
  }
  // because this is the authenticated user, we can return more info.
  res.status(200).json({ ...user, jam: jam?.id });
});

const getUserFromSession = async (sessionId: string | null) => {
  if (!sessionId) {
    return null;
  }
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      exp: { gt: new Date() },
    },
  });
  if (!session) {
    return null;
  }
  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
    },
  });
  const jam =
    user &&
    (await prisma.userInJam.findFirst({
      where: {
        userId: session.userId,
      },
    }));

  return {
    ...user,
    userInJam: jam,
  };
};

authRouter.post("/login", async (req, res) => {
  const { type, force } = req.query;

  const user = await getUserFromSession(req.cookies[USER_COOKIE]);

  if (user && !force) {
    return res.status(200).json(user);
  }

  if (type === "anon") {
    const user = await prisma.user.create({
      data: {
        anon: true,
        exp: add(new Date(), { days: 1 }),
      },
    });
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        exp: add(new Date(), { hours: 12 }),
      },
    });
    return res.cookie(USER_COOKIE, session.id).status(201).json(user);
  }
  res.status(400).send();
});
