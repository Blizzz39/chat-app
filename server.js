// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// "public" Ordner bereitstellen (für HTML, CSS, JS)
app.use(express.static('public'));

// Wenn jemand verbunden ist
io.on('connection', (socket) => {
    console.log('Ein Benutzer hat sich verbunden.');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // Nachricht an alle Clients senden
    });

    socket.on('disconnect', () => {
        console.log('Ein Benutzer hat die Verbindung getrennt.');
    });
});

// Server starten
http.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
