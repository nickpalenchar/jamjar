import express, { NextFunction, type Request, type Response } from "express";
import { type Server } from "http";
import { getLogger } from "./logging";
import { createProxyMiddleware } from "http-proxy-middleware";
import { config } from "./config";
import bodyParser from "body-parser";
import { devStrategy, basicAuthStrategy } from "./authStrategies";
import { AuthenticationResult } from "./middleware/types";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { authRouter } from "./routers/auth";

const prisma = new PrismaClient();
const log = getLogger();

const app = express();

let server: Server;

export const start = () => {
  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use("/auth", authRouter);

  /**
   * Authenticates based on a given strategy.
   *
   * DEV STRATEGY
   * If the environment is DEV and no strategy is specified, the Dev strategy
   * is used.
   *
   * BASIC
   * The usual strategy, which sends 'Basic <authStrategy>' in the header. This
   * is similar to, but not the same, as the standard http basic strategy.
   *
   * Upon successful authentication, the request is sent downstream to an internal
   * service (the API) with a 'User-Context' header set to the authenticated userId.
   */
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    let result: AuthenticationResult;
    if (!authHeader && config.Env === "DEV") {
      result = await devStrategy();
    } else if (authHeader && authHeader.startsWith("Basic ")) {
      result = await basicAuthStrategy(authHeader.split(" ")[1]);
    } else {
      result = { success: false, reason: "Not authenticated." };
    }
    if (!result.success) {
      res.status(401).send(result.reason);
      return;
    }
    req.body.authResult = result;
    log.warn("COOKIES?", { req: req.cookies });
    next();
  });

  log.info("Proxying requests", { proxyTarget: config.DEPENDENCY_API });
  app.use(
    createProxyMiddleware({
      target: config.DEPENDENCY_API,
      changeOrigin: true,
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader("User-Context", req.body.authResult.id);
        delete req.body.authResult;
      },
    }),
  );

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
  server = app.listen(1155, function () {
    console.log("Started at http://localhost:1155");
  });
};

export const stop = async (): Promise<void> =>
  new Promise((resolve) => {
    if (!server) {
      return resolve();
    }
    server.close(() => resolve());
  });

export { app };
