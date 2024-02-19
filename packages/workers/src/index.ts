"use strict";
import express, { NextFunction, type Request, type Response } from "express";
import {
  isMainThread,
} from "node:worker_threads";
import { router } from "./main/mainThread";

import { availableParallelism } from "node:os";
import process from "node:process";
import { getLogger } from "./logging";

const log = getLogger();

const numCPUs = availableParallelism();

if (isMainThread) {
  const app = express();

  app.use((req: Request, res: Response, next: NextFunction) => {
    log.debug("NEW REQUEST", {
      route: req.route,
    });
    next();
  });

  app.use("/api", router);
  app.use(function fourOhFourHandler(
    _: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.status(404).send();
    next();
  });
  app.use(function fiveHundredHandler(
    err: Error,
    req: Request,
    res: Response,
    _: NextFunction,
  ): void {
    console.error(err);
    res.status(500).send();
  });

  // Start server
  app.listen(1234, function () {
    console.log("Started at http://localhost:1234");
  });
} else {
  console.log("WORKER STARTING");
  // Error handlers
}
