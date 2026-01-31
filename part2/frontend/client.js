// On instance une connexion WebSocket vers l'URL du backend
const socket = io("http://localhost:8080"); // localhost parce que partage de port Docker
const chat = document.getElementById("chat");

// Handler quand la connexion WebSocket est successfull
socket.on("connect", () => {
  console.log("Connected with id:", socket.id);
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

// Appelée quand le user valide le formulaire pour send un message    
function send() {
  const input = document.getElementById("msg");

  if (input.value.trim() !== "") {

    // On génère un message avec le label "chat"
    socket.emit("chat", input.value);

    input.value = "";
  }
}
