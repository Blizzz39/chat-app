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

// Benutzer-Farben
const userColors = {};
function getUserColor(username){
    if(!userColors[username]){
        const letters = '0123456789ABCDEF';
        let color = '#';
        for(let i=0; i<6; i++){
            color += letters[Math.floor(Math.random()*16)];
        }
        userColors[username] = color;
    }
    return userColors[username];
}

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const clearBtn = document.getElementById('clearBtn');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(input.value){
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', ({user, msg}) => {
    const item = document.createElement('li');

    // Animation: fade-in + slide
    item.style.opacity = 0;
    item.classList.add('new-msg');

    const userSpan = document.createElement('span');
    userSpan.classList.add('user');
    userSpan.textContent = user + ':';
    userSpan.style.color = getUserColor(user);

    item.appendChild(userSpan);
    item.appendChild(document.createTextNode(msg));
    messages.appendChild(item);

    setTimeout(() => { item.style.opacity = 1; }, 10);
    messages.scrollTop = messages.scrollHeight;
});

clearBtn.addEventListener('click', () => {
    if(confirm("Bist du sicher, dass du den Chat leeren willst?")){
        socket.emit('clear chat');
    }
});

socket.on('chat cleared', () => {
    messages.innerHTML = '';
});
