import { type Response } from "express";
import { createTestContext } from "../createTestContext";

export const resStub: jest.Mocked<Response> = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  json: jest.fn(),
} as unknown as jest.Mocked<Response>;

export const createReq = (args?: Record<string, any>): any => {
  const defaults = {
    body: {
      context: createTestContext()
    },
    query: {},
    params: {},
  };
  return {
    body: {
      ...defaults.body, ...args?.body
    },
    query: {
      ...defaults.query, ...args?.query
    },
    params: {
      ...defaults.params, ...args?.params,
    }
  }
}