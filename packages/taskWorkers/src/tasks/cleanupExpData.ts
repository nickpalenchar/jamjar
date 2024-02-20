import { PrismaClient } from "@prisma/client";
import { getLoggerWithData } from "../logging";
import { isBefore } from "date-fns";

const prisma = new PrismaClient();

const log = getLoggerWithData({ taskName: 'cleanup_exp_data' });

export const cleanupExpData = async () => {
  const now = new Date();
  const { count } = await prisma.user.deleteMany({
    where: {
      anon: true,
      exp: { lt: now },
    },
  });
  log.info('Deleted expired user records', { count });
}