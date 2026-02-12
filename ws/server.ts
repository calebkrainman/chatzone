import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Post } from "../generated/prisma";

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on(`connection`, async (socket: Socket) => {
  socket.on(`join`, (channelId) => {
    socket.join(`${channelId}`);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on(`chat message`, (msg: Post) => {
    io.to(msg.channelId).emit(`chat message`, msg);
    console.log(`Message received: ${msg.content} in channel ${msg.channelId}`);
  });

  socket.on(`disconnect`, () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const WEBSOCKET_PORT = 3001;
server.listen(WEBSOCKET_PORT, () => {
  console.log(
    `WebSocket server is running on ws://localhost:${WEBSOCKET_PORT}`,
  );
});
