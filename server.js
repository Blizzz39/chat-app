const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// "public" Ordner bereitstellen
app.use(express.static('public'));

// Benutzername → Passwort
const allowedUsers = {
    "Blizzz": "1234",
    "Samuel": "1234",
    "Temp": "1234"
};

// Temporäres Nachrichten-Array
let messages = [];

io.on('connection', (socket) => {

    // Login prüfen
    socket.on('login', ({name, password}) => {
        if(allowedUsers[name] && allowedUsers[name] === password){
            socket.username = name;
            socket.emit('login-success');

            // Alte Nachrichten senden
            messages.forEach(m => socket.emit('chat message', m));
        } else {
            socket.emit('login-failed');
            socket.disconnect();
        }
    });

    // Neue Nachricht
    socket.on('chat message', (msg) => {
        if(socket.username){
            const messageData = {user: socket.username, msg};
            messages.push(messageData);
            io.emit('chat message', messageData);
        }
    });

    // Chat leeren
    socket.on('clear chat', () => {
        if(socket.username){ // nur eingeloggte Benutzer
            messages = []; // Array zurücksetzen
            io.emit('chat cleared'); // allen Clients mitteilen
        }
    });

});

http.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
