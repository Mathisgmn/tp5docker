import http from "http";
import { Server } from "socket.io";

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

io.on("connection", (socket) => {
  console.log(`client_connected id=${socket.id}`);

  socket.on("chat", (msg) => {
    const payload = String(msg || "").trim();
    if (!payload) {
      return;
    }
    console.log(`message_received id=${socket.id} payload=${payload}`);
    io.emit("chat", payload);
  });

  socket.on("disconnect", (reason) => {
    console.log(`client_disconnected id=${socket.id} reason=${reason}`);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`backend_listening port=${port}`);
});
