// On instance une connexion WebSocket vers l'URL du backend
const socket = io("http://localhost:8080", {
  path: "/socket/",
  transports: ["websocket"]
}); // localhost parce que partage de port Docker
const chat = document.getElementById("chat");
const roomButtons = document.querySelectorAll("[data-room]");
const roomLabel = document.getElementById("room-name");
const userCount = document.getElementById("user-count");
let currentRoom = roomButtons[0]?.dataset.room || "";

// Handler quand la connexion WebSocket est successfull
socket.on("connect", () => {
  console.log("Connected with id:", socket.id);
  if (currentRoom) {
    socket.emit("join_room", currentRoom);
  }
});

// Handler quand un event avec le label "chat" est reçu
socket.on("chat", (msg) => {
  const line = document.createElement("div");
  line.textContent = msg;
  chat.appendChild(line);
  chat.scrollTop = chat.scrollHeight;
});

// Handler quand la connexion WebSocket se termine (le serveur a coupé?)
socket.on("disconnect", () => {
  console.log("Disconnected");
});

socket.on("user_count", (count) => {
  userCount.textContent = String(count);
});

socket.on("room_joined", (room) => {
  currentRoom = room;
  roomLabel.textContent = room;
  roomButtons.forEach((button) => {
    button.disabled = button.dataset.room === room;
  });
});

roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextRoom = button.dataset.room;
    if (!nextRoom) {
      return;
    }
    socket.emit("join_room", nextRoom);
  });
});

// Appelée quand le user valide le formulaire pour send un message    
function send() {
  const input = document.getElementById("msg");

  if (input.value.trim() !== "") {

    // On génère un message avec le label "chat"
    socket.emit("chat", input.value);

    input.value = "";
  }
}
