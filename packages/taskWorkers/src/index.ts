import express, { NextFunction, type Request, type Response } from "express";
import { type Server } from "http";
import { getLogger } from "./logging";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { config } from "./config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { TaskWorker } from "./taskWorker";

const prisma = new PrismaClient();
const log = getLogger();

let server: Server;
const MAX_WORKERS = 2;
const INTERVAL = 10;
export const start = () => {
  for (let i = 0; i < MAX_WORKERS; i++) {
    const task = new TaskWorker({
      interval: INTERVAL,
    });
    // the first task gets an initial start
    task.start(i === 0);
  }
};
