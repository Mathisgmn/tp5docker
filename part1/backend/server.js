import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const port = parseInt(process.env.BACKEND_PORT || "8080", 10);

const server = http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket backend running\n");
});

const wss = new WebSocketServer({ server });

const broadcast = (data) => {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
};

const getConnectedClientsCount = () =>
  Array.from(wss.clients).filter(
    (client) => client.readyState === WebSocket.OPEN
  ).length;

const broadcastUserCount = () => {
  broadcast(
    JSON.stringify({ type: "user_count", count: getConnectedClientsCount() })
  );
};

wss.on("connection", (ws, req) => {
  const clientAddress = req.socket.remoteAddress || "unknown";
  console.log(`client_connected address=${clientAddress}`);
  broadcastUserCount();

  ws.on("message", (message) => {
    const payload = message.toString();
    console.log(`message_received payload=${payload}`);
    broadcast(
      JSON.stringify({ type: "message", payload })
    );
  });

  ws.on("close", () => {
    console.log(`client_disconnected address=${clientAddress}`);
    broadcastUserCount();
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`backend_listening port=${port}`);
});
