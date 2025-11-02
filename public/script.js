const socket = io();

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

const userListEl = document.getElementById("userList");
const chatHeader = document.getElementById("chatHeader");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const clearBtn = document.getElementById("clearBtn");

let username = null;
let currentChat = "Gruppe";

// --- LOGIN ---
loginBtn.addEventListener("click", () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    if (user && pass) socket.emit("login", { username: user, password: pass });
});

socket.on("loginSuccess", (user) => {
    username = user;
    loginScreen.classList.add("hidden");
    setTimeout(() => loginScreen.style.display = "none", 500);
    chatScreen.classList.remove("hidden");
    selectChat("Gruppe");
});

socket.on("loginError", (msg) => (errorMsg.textContent = msg));

// --- Benutzerliste ---
socket.on("userList", (list) => {
    userListEl.innerHTML = "";

    const groupItem = document.createElement("li");
    groupItem.textContent = "Gruppe";
    groupItem.classList.add("active");
    groupItem.addEventListener("click", () => selectChat("Gruppe"));
    userListEl.appendChild(groupItem);

    list.filter(u => u !== username).forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        li.addEventListener("click", () => selectChat(u));
        userListEl.appendChild(li);
    });
});

function selectChat(otherUser) {
    currentChat = otherUser;
    chatHeader.textContent = `Chat mit ${otherUser}`;
    chatBox.innerHTML = "";
    document.querySelectorAll("#userList li").forEach(li => li.classList.remove("active"));
    [...document.querySelectorAll("#userList li")].find(li => li.textContent.includes(otherUser)).classList.add("active");
    socket.emit("joinChat", otherUser);
}

// --- Chat History ---
socket.on("chatHistory", (history) => {
    chatBox.innerHTML = "";
    history.forEach(addMessage);
});

// --- Neue Nachrichten ---
socket.on("chatMessage", (msg) => {
    if (msg.sender === username || currentChat === "Gruppe" || msg.sender === currentChat)
        addMessage(msg);
});

// --- Nachricht senden ---
sendBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;
    socket.emit("chatMessage", { recipient: currentChat, text });
    messageInput.value = "";
});

// --- Enter-Taste senden ---
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
    }
});

// --- Datei-Upload ---
fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Maximal 5 MB!");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();

    // Datei-Nachricht ohne Vorschau
    socket.emit("fileMessage", { recipient: currentChat, file: { name: file.name, url: data.url } });
    fileInput.value = "";
});

// --- Nachrichten anzeigen ---
function addMessage({ sender, text, file }) {
    const div = document.createElement("div");
    div.className = "message";
    const color = sender === username ? "#9B5DE5" : "#F15BB5";

    let content = `<strong style="color:${color}">${sender}:</strong> `;

    if (file) {
        // Nur Dateiname als Link
        content += `<a href="${file.url}" target="_blank">${file.name}</a>`;
    } else {
        content += text;
    }

    div.innerHTML = content;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Chat leeren ---
clearBtn.addEventListener("click", () => {
    if (confirm("Alle Nachrichten und Uploads dieses Chats löschen?")) {
        socket.emit("clearChat", currentChat);
    }
});
