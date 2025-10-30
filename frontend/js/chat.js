document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3030';
    let socket;
    let currentUser = null;
    let currentRecipient = null;

    const userList = document.getElementById('user-list');
    const currentUserDisplay = document.getElementById('current-user-display');
    const welcomeMessage = document.getElementById('welcome-message');
    const chatWindow = document.getElementById('chat-window');
    const chattingWith = document.getElementById('chatting-with');
    const messages = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    // Pegando usuário logado da página anterior
    async function getCurrentUser() {
        try {
            const res = await fetch(`${API_URL}/session`); // endpoint que retorna o usuário logado
            const data = await res.json();
            if (data.success) {
                currentUser = data.user.name; // ou id
                currentUserDisplay.textContent = currentUser;
                connectToChat();
            } else {
                alert("Usuário não logado!");
                window.location.href = '/login';
            }
        } catch (err) {
            console.error(err);
        }
    }

    const connectToChat = () => {
        socket = io('http://localhost:3000'); // servidor do chat

        socket.on('connect', () => {
            socket.emit('authenticate', currentUser); // envia nome ou id do usuário
        });

        socket.on('update-user-list', (users) => {
            userList.innerHTML = '';
            users.forEach(user => {
                if (user === currentUser) return; 
                const li = document.createElement('li');
                li.textContent = user;
                li.dataset.username = user;
                li.addEventListener('click', () => startPrivateChat(user));
                userList.appendChild(li);
            });
        });

        socket.on('private-message', ({ sender, message }) => {
            if (sender === currentRecipient || sender === currentUser) {
                displayMessage(sender, message);
            }
        });

        socket.on('history', (history) => {
            messages.innerHTML = '';
            history.forEach(msg => displayMessage(msg.sender, msg.message));
        });
    };

    const startPrivateChat = (recipient) => {
        currentRecipient = recipient;
        chatWindow.classList.remove('hidden');
        chattingWith.textContent = recipient;
        messages.innerHTML = '';
        socket.emit('load-history', recipient);
    };

    const displayMessage = (sender, message) => {
        const li = document.createElement('li');
        li.textContent = message;
        li.classList.add(sender === currentUser ? 'sent' : 'received');
        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight;
    };

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;
        if (message && currentRecipient) {
            socket.emit('private-message', { recipient: currentRecipient, message });
            messageInput.value = '';
        }
    });

    getCurrentUser();
});
