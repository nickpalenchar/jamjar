import express, { NextFunction, type Request, type Response } from "express";
import { type Server } from "http";
import { getLogger } from "./logging";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { config } from "./config";
import bodyParser from "body-parser";
import {
  devStrategy,
  basicAuthStrategy,
  devJamAdminStrategy,
} from "./authStrategies";
import { AuthenticationResult } from "./middleware/types";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { authRouter } from "./routers/auth";
import { publicStrategy } from "./authStrategies/public";

const prisma = new PrismaClient();
const log = getLogger();

const app = express();

let server: Server;

export const start = () => {
  app.use((req, res, next) => {
    if (config.ALLOWED_HOSTS.includes(req.hostname)) {
      return next();
    }
    log.error("Host header mismatch", { hostName: req.hostname });
    res.status(403).send("Forbidden ");
  });

  app.use(bodyParser.json());
  app.use(cookieParser());

  // PUBLIC ROUTES

  app.use("/auth", authRouter);

  app.use(
    createProxyMiddleware("/socket", {
      target: config.DEPENDENCY_API,
      changeOrigin: true,
      ws: true,
      logLevel: "debug",
    }),
  );

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
    const asAdminHeader = req.header("X-As-Admin");
    let result: AuthenticationResult;
    if (!authHeader && asAdminHeader && config.Env === "DEV") {
      result = await devStrategy();
    } else if (req.cookies.asAdminOfJam) {
      result = await devJamAdminStrategy(req.cookies.asAdminOfJam);
    } else if (req.cookies.jivesession) {
      result = await basicAuthStrategy(req.cookies.jivesession);
    } else if (authHeader && authHeader.startsWith("Basic ")) {
      result = await basicAuthStrategy(authHeader.split(" ")[1]);
    } else if (req.route === "/socket.io") {
      console.log("doing the tuhtneohusneohuteo");
      result = publicStrategy(req.route);
    } else {
      result = { success: false, reason: "Not authenticated." };
    }
    if (!result.success) {
      res.status(401).send(result.reason);
      return;
    }
    req.body.authResult = result;
    next();
  });

  app.use(
    createProxyMiddleware({
      target: config.DEPENDENCY_API,
      // changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader("User-Context", req.body.authResult.id);
        // delete req.body.authResult;
        // proxyReq.write(JSON.stringify({ foo: "bar" }));
        fixRequestBody(proxyReq, req);
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
