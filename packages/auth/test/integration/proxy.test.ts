import { start, stop, app } from "../../src/index";
import { type Response, type Request } from "express";
import { add } from "date-fns";
import request from "supertest";
import { sessionDoc } from "../documents/session";
import { userDoc } from "../documents/user";

const mockUserFindFirst = jest.fn();
const mockSessionFindFirst = jest.fn();

jest.mock("@prisma/client");

jest.mock("http-proxy-middleware", () => ({
  createProxyMiddleware({ onProxyReq }: { onProxyReq: CallableFunction }) {
    return (req: Request, res: Response) => {
      const proxyReq: Record<string, any> = {};
      onProxyReq?.(
        {
          setHeader(header: string, value: any) {
            proxyReq[header] = value;
          },
        },
        req,
      );
      res.status(200).json({ proxyReq });
    };
  },
}));

describe("proxy requests", () => {
  beforeAll(start);

  afterEach(jest.clearAllMocks);

  afterAll(async () => {
    await stop();
  });

  it("Sets the auth header when theres a valid session", async () => {
    mockSessionFindFirst.mockImplementation(async ({ where }) => {
      console.log("smockerrsssss");
      return where?.id === sessionDoc.id ? sessionDoc : null;
    });
    mockUserFindFirst.mockImplementation(async ({ where }) =>
      where?.id === userDoc.id ? userDoc : null,
    );

    const response = await request(app)
      .get("/")
      .timeout(5000)
      .set("Authorization", `Basic ${sessionDoc.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.proxyReq).toHaveProperty("User-Context");
    expect(response.body.proxyReq["User-Context"]).toBe(userDoc.id);
  });
});
