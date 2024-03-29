import { Request, Response, NextFunction } from "express";

export type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<any> | any;

export type SuccessfulAuthentication = { success: true, type: 'user', id: string } | { success: true, type: 'anonymous', id: null};
export type FailedAuthentication = { success: false, reason: string };
export type AuthenticationResult = SuccessfulAuthentication | FailedAuthentication
