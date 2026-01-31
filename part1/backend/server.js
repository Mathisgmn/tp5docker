import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const port = parseInt(process.env.BACKEND_PORT || "8080", 10);

const server = http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket backend running\n");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const clientAddress = req.socket.remoteAddress || "unknown";
  console.log(`client_connected address=${clientAddress}`);

  ws.on("message", (message) => {
    console.log(`message_received payload=${message}`);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`echo:${message}`);
      }
    }
  });

  ws.on("close", () => {
    console.log(`client_disconnected address=${clientAddress}`);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`backend_listening port=${port}`);
});
