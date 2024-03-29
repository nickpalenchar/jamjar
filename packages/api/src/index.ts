import "dotenv/config";

import express, { NextFunction, type Request, type Response } from "express";
import { createServer } from "node:http"; // TODO maybe this is https??
import { getLogger } from "@jamjar/util";
import httpErrors from "http-errors";
import { createContext } from "./middleware/createContext";
import bodyParser from "body-parser";
import { jam } from "./routers/jam";
import { health } from "./routers/health";
import { spotify } from "./routers/spotify";
import { PrismaClient } from "@prisma/client";
import { connectSocket } from "./websocket";

const log = getLogger();

const app = express();
const server = createServer(app);
app.use(bodyParser.json());

connectSocket(server);

app.use((req: Request, res: Response, next: NextFunction) => {
  log.info("NEW REQUEST", {
    route: req.route,
    socket: req.socket.connecting,
  });
  next();
});

app.use(createContext);

app.get("/healthz", (req: Request, res: Response) =>
  res.status(200).json({ context: req.body.context.principal }),
);

// Routers //

app.use("/api/health", health);
app.use("/api/jam", jam);
app.use("/api/spotify", spotify);

// Error handling //

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
  if (err instanceof httpErrors.HttpError) {
    const { statusCode, message } = err;
    log.warn("http Error: ", { statusCode, message });
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  log.error("5xx Error thrown", err);
  res.status(500).send("Something went wrong.");
});

new PrismaClient().workerTask.findFirst({
  where: {
    taken: false,
  },
});
// Start server
server.listen(1133, function () {
  console.log("Started at http://localhost:1133");
});
