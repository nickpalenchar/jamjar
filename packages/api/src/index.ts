import express, { NextFunction, type Request, type Response } from "express";
import process from "node:process";
import { getLogger } from "./logging";
import { config } from "./config";
import { createContext } from "./middleware/createContext";
import bodyParser from "body-parser";

const log = getLogger();

const app = express();

app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  log.debug("NEW REQUEST", {
    route: req.route,
  });
  next();
});

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
app.listen(1133, function () {
  console.log("Started at http://localhost:1133");
});
