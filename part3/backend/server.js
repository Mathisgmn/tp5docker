import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const port = parseInt(process.env.BACKEND_PORT || "8080", 10);

const server = http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.IO backend running\n");
});

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const pubClient = createClient({ url: "redis://redis:6379" });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));

const rooms = ["meow", "nap", "zoomies"];

const broadcastUserCount = () => {
  io.emit("user_count", io.engine.clientsCount);
};

io.on("connection", (socket) => {
  console.log(`client_connected id=${socket.id}`);
  broadcastUserCount();

  socket.data.room = rooms[0];
  socket.join(socket.data.room);
  socket.emit("room_joined", socket.data.room);

  socket.on("chat", (msg) => {
    const payload = String(msg || "").trim();
    if (!payload) {
      return;
    }
    console.log(`message_received id=${socket.id} payload=${payload}`);
    if (!socket.data.room) {
      return;
    }
    io.to(socket.data.room).emit("chat", payload);
  });

  socket.on("join_room", (room) => {
    const nextRoom = String(room || "");
    if (!rooms.includes(nextRoom)) {
      return;
    }
    if (socket.data.room) {
      socket.leave(socket.data.room);
    }
    socket.data.room = nextRoom;
    socket.join(nextRoom);
    socket.emit("room_joined", nextRoom);
  });

  socket.on("disconnect", (reason) => {
    console.log(`client_disconnected id=${socket.id} reason=${reason}`);
    broadcastUserCount();
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`backend_listening port=${port}`);
});
