const socket = io();

// Login abfragen
let username = prompt("Gib deinen Namen ein:");
let password = prompt("Gib dein Passwort ein:");

socket.emit('login', {name: username, password: password});

socket.on('login-success', () => {
    alert("Login erfolgreich!");
});

socket.on('login-failed', () => {
    alert("Login fehlgeschlagen! Du wirst getrennt.");
});

// Chatfunktion
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(input.value){
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

// Nachrichten empfangen
socket.on('chat message', ({user, msg}) => {
    const item = document.createElement('li');
    const userSpan = document.createElement('span');
    userSpan.classList.add('user');
    userSpan.textContent = user + ':';
    item.appendChild(userSpan);
    item.appendChild(document.createTextNode(msg));
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
