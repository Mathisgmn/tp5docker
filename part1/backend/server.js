import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const port = parseInt(process.env.BACKEND_PORT || "8080", 10);

const server = http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket backend running\n");
});

const wss = new WebSocketServer({ server });
let connectedClients = 0;

const sendJson = (client, data) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

const broadcastJson = (data) => {
  const payload = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
};

const broadcastUserCount = () => {
  broadcastJson({ type: "user_count", count: connectedClients });
};

wss.on("connection", (ws, req) => {
  const clientAddress = req.socket.remoteAddress || "unknown";
  let hasDisconnected = false;

  connectedClients += 1;
  console.log(`client_connected address=${clientAddress}`);
  broadcastUserCount();

  const handleDisconnect = (reason) => {
    if (hasDisconnected) {
      return;
    }
    hasDisconnected = true;
    connectedClients = Math.max(connectedClients - 1, 0);
    console.log(`client_disconnected address=${clientAddress} reason=${reason}`);
    broadcastUserCount();
  };

  ws.on("message", (message) => {
    const payload = message.toString().trim();
    if (!payload) {
      return;
    }
    console.log(`message_received payload=${payload}`);
    broadcastJson({ type: "message", payload });
  });

  ws.on("close", () => handleDisconnect("close"));
  ws.on("error", (error) => {
    console.error(`client_error address=${clientAddress}`, error);
    handleDisconnect("error");
  });

  sendJson(ws, { type: "user_count", count: connectedClients });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`backend_listening port=${port}`);
});
