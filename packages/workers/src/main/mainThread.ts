import { Router, type Request, type Response } from "express";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { ParamsDictionary } from "express-serve-static-core";

const router: Router = Router();

router.get("/test", (req: Request, res: Response) => {
  res.status(200).send("hello from router!");
});

router.post("/new/:jamId", async (request: Request, response: Response) => {
  const { jamId } = request.params;
  const currentWorker = await prisma.worker.findFirst({
    where: {
      jamId,
    },
  });

  if (currentWorker) {
    return response.status(409).send("Worker for jamId already exists");
  }
  const jam = await prisma.jam.findFirstOrThrow({
    where: {
      id: jamId,
    },
  });
  const worker = await prisma.worker.create({
    data: {
      jamId: jam.id,
    },
  });
  response.status(201).json({ workerId: worker.id });
});

export { router };
