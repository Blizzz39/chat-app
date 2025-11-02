import express from "express";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Benutzer (für Login)
const users = {
    "Blizzz": "1234",
    "Samuel": "1234",
    "Temp": "1234"
};

// Chats im RAM speichern
let chats = {
    "Gruppe": []
};

// --- MULTER Setup für Uploads ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "_" + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload Endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen" });

    // Rückgabe nur Name + URL
    res.json({
        url: `/uploads/${req.file.filename}`,
        name: req.file.originalname
    });
});

// Uploads statisch verfügbar machen
app.use("/uploads", express.static(uploadDir));

// --- SOCKET.IO ---
io.on("connection", (socket) => {
    let currentUser = null;

    // LOGIN
    socket.on("login", ({ username, password }) => {
        if (users[username] && users[username] === password) {
            currentUser = username;
            socket.emit("loginSuccess", username);
            io.emit("userList", Object.keys(users));
        } else {
            socket.emit("loginError", "Benutzername oder Passwort falsch");
        }
    });

    // Chat auswählen
    socket.on("joinChat", (chatName) => {
        if (!chats[chatName]) chats[chatName] = [];
        socket.emit("chatHistory", chats[chatName]);
    });

    // Textnachrichten
    socket.on("chatMessage", ({ recipient, text }) => {
        const message = { sender: currentUser, text };
        if (!chats[recipient]) chats[recipient] = [];
        chats[recipient].push(message);
        io.emit("chatMessage", message);
    });

    // Datei-Nachrichten
    socket.on("fileMessage", ({ recipient, file }) => {
        const message = { sender: currentUser, file };
        if (!chats[recipient]) chats[recipient] = [];
        chats[recipient].push(message);
        io.emit("chatMessage", message);
    });

    // Chat leeren
    socket.on("clearChat", (chatName) => {
        if (chats[chatName]) {
            chats[chatName] = [];
            io.emit("chatHistory", []);
        }
    });
});

// SERVER START
server.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
});
