import { Server as SocketServer } from "socket.io";
import { type Server } from "node:http";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

let io: SocketServer;

export const connectSocket = (server: Server) => {
  console.log("setting up socket!");
  if (io) {
    return io;
  }
  io = new SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, { path: "/socket" });

  io.on("connection", (socket) => {
    console.log("NEW CLIENT CONNECTION");
    const room = new URL(socket.handshake.headers.referer ?? "").pathname;

    socket.join(room);
    socket.emit("foo", { message: "a new client connected" });
  });

  return io;
};

export const getSocket = (): Promise<SocketServer> =>
  new Promise((resolve) => {
    while (true) {
      if (io) {
        return resolve(io);
      }
    }
  });
