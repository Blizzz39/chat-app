import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB mit erhöhtem Timeout
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 30000 // 30 Sekunden Timeout
})
    .then(() => console.log("✅ Mit MongoDB verbunden"))
    .catch(err => console.error("❌ MongoDB-Verbindungsfehler:", err));

const chatSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model("ChatMessage", chatSchema);

// Benutzer
const users = {
    Blizzz: "1234",
    Samuel: "1234",
    Temp: "1234"
};

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", async (socket) => {
    console.log("🔌 Neuer Benutzer verbunden");

    // Lade nur die letzten 50 Nachrichten
    try {
        const messages = await ChatMessage.find()
            .sort({ timestamp: -1 })
            .limit(50);
        socket.emit("chatHistory", messages.reverse());
    } catch (err) {
        console.error("Fehler beim Laden der Nachrichten:", err);
    }

    socket.on("login", ({ username, password }) => {
        if (users[username] === password) {
            socket.username = username;
            socket.emit("loginSuccess", username);
            io.emit("userJoined", username);
        } else {
            socket.emit("loginError", "Falscher Benutzername oder Passwort");
        }
    });

    socket.on("chatMessage", async (msg) => {
        if (!socket.username) return;
        const chatMsg = new ChatMessage({ username: socket.username, message: msg });
        await chatMsg.save();
        io.emit("chatMessage", chatMsg);
    });

    socket.on("clearChat", async () => {
        await ChatMessage.deleteMany({});
        io.emit("chatCleared");
    });

    socket.on("disconnect", () => {
        if (socket.username) io.emit("userLeft", socket.username);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server läuft auf http://localhost:${PORT}`));
