import express, { NextFunction, type Request, type Response } from "express";
import { getLogger } from "./logging";
import { createProxyMiddleware } from 'http-proxy-middleware'
import { config } from "./config";
import { createContext } from "./middleware/createContext";
import bodyParser from "body-parser";
import { devStrategy, basicAuthStrategy } from "./authStrategies";
import { AuthenticationResult } from "./middleware/types";

import 'dotenv/config';

const log = getLogger();

const app = express();

app.use(bodyParser.json());


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
  console.log('new request yooo');
  const authHeader = req.headers['authorization'];

  let result: AuthenticationResult;
  if (!authHeader && config.Env === 'DEV' ) {
    result = await devStrategy()
  } else if (authHeader) {
    result = await basicAuthStrategy(authHeader);
  }
  else {
    result = { success: false, reason: 'Not authenticated.'}
  }
  if (!result.success) {
    res.status(401).send(result.reason);
  }
  req.body.authResult = result;
  next();
});

app.use(createProxyMiddleware({
  target: config.DEPENDENCY_API,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('User-Context', req.body.authResult.id);
  }, 
}))

app.use(createContext);

app.get("/healthz", (req: Request, res: Response) =>
  res.status(200).json({ context: req.body.context.principal }),
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
app.listen(1155, function () {
  console.log("Started at http://localhost:1155");
});
