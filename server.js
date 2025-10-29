const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// "public" Ordner bereitstellen
app.use(express.static('public'));

// Benutzername → Passwort (einfach für Lernprojekt)
const allowedUsers = {
    "Blizzz": "1234",
    "Samuel": "1234"
};

io.on('connection', (socket) => {

    // Login prüfen
    socket.on('login', ({name, password}) => {
        if(allowedUsers[name] && allowedUsers[name] === password){
            socket.username = name; // Benutzer speichern
            socket.emit('login-success');
        } else {
            socket.emit('login-failed');
            socket.disconnect(); // unbefugten Benutzer trennen
        }
    });

    // Chatnachricht
    socket.on('chat message', (msg) => {
        if(socket.username){ // nur autorisierte Benutzer
            io.emit('chat message', {user: socket.username, msg}); // Username + Nachricht senden
        }
    });

    socket.on('disconnect', () => {
        if(socket.username){
            console.log(`${socket.username} hat die Verbindung getrennt.`);
        }
    });

});

http.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
