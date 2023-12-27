import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";

export type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<any> | any;

export interface Context {
  log: Logger;
  principal: {
    user: Record<string, any> | null;
  };
}