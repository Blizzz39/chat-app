const socket = io();

// Login
const loginDiv = document.getElementById("loginDiv");
const chatDiv = document.getElementById("chatDiv");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

loginBtn.addEventListener("click", () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    socket.emit("login", { username, password });
});

socket.on("loginSuccess", (username) => {
    loginDiv.style.display = "none";
    chatDiv.style.display = "block";
    addMessageToChat({ username: "System", message: `Willkommen ${username}!` });
});

socket.on("loginError", (msg) => { loginError.textContent = msg; });

// Chat-Verlauf
const chatBox = document.getElementById("chatBox");
socket.on("chatHistory", (messages) => {
    chatBox.innerHTML = "";
    messages.forEach(addMessageToChat);
});

// Neue Nachrichten
socket.on("chatMessage", addMessageToChat);

// Chat leeren
const clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", () => { socket.emit("clearChat"); });

socket.on("chatCleared", () => { chatBox.innerHTML = ""; });

// Nachrichten senden
const chatForm = document.getElementById("chatForm");
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("messageInput").value;
    if (msg.trim() === "") return;
    socket.emit("chatMessage", msg);
    document.getElementById("messageInput").value = "";
});

// Funktion zum Hinzufügen von Nachrichten
function addMessageToChat(msg) {
    const p = document.createElement("p");
    p.textContent = `${msg.username}: ${msg.message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}
