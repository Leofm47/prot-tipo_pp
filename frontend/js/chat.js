document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3030';
  let socket;
  let currentUserId = null;
  let currentUserName = null;
  let currentRecipientId = null;

  const userList = document.getElementById('user-list');
  const currentUserDisplay = document.getElementById('current-user-display');
  const chatWindow = document.getElementById('chat-window');
  const chattingWith = document.getElementById('chatting-with');
  const messages = document.getElementById('messages');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');

  // 🔹 MOVER pra cá!
  async function loadAllUsers() {
    const res = await fetch(`${API_URL}/all-users`);
    const allUsers = await res.json();
    return allUsers;
  }

  function renderUserList(users, onlineList = []) {
    userList.innerHTML = '';
    users.forEach(u => {
      if (String(u.id) === String(currentUserId)) return;
      const li = document.createElement('li');
      const isOnline = onlineList.some(o => String(o.id) === String(u.id));
      li.textContent = `${u.name}${isOnline ? ' (online)' : ' (offline)'}`;
      li.dataset.userid = u.id;
      li.addEventListener('click', () => startPrivateChat(u.id, u.name));
      userList.appendChild(li);
    });
  }

  async function getCurrentUser() {
    const storedId = localStorage.getItem('usuarioId');
    if (!storedId) {
      alert('Você precisa estar logado para usar o chat.');
      window.location.href = 'login.html';
      return false;
    }
    currentUserId = storedId;

    try {
      const res = await fetch(`${API_URL}/users/${currentUserId}`);
      const user = await res.json();
      currentUserName = user.name || currentUserId;
      currentUserDisplay.textContent = currentUserName;
      return true;
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      currentUserDisplay.textContent = currentUserId;
      return true;
    }
  }

  function connectToChat() {
    socket = io('http://localhost:3000');

    socket.on('connect', () => {
      socket.emit('authenticate', { id: currentUserId, name: currentUserName });
    });

    socket.on('update-user-list', (onlineUsers) => {
      loadAllUsers().then(all => renderUserList(all, onlineUsers));
    });

    socket.on('private-message', ({ sender, senderName, message }) => {
      if (String(sender) === String(currentRecipientId) || String(sender) === String(currentUserId)) {
        displayMessage(
          sender === currentUserId ? currentUserName : senderName || sender,
          message,
          String(sender) === String(currentUserId)
        );
      }
    });

    socket.on('history', (history) => {
      messages.innerHTML = '';
      history.forEach(h =>
        displayMessage(h.senderName || h.senderId, h.message, String(h.senderId) === String(currentUserId))
      );
    });
  }

  const startPrivateChat = (recipientId, recipientName) => {
    currentRecipientId = recipientId;
    chatWindow.classList.remove('hidden');
    chattingWith.textContent = recipientName || recipientId;
    messages.innerHTML = '';
    socket.emit('load-history', recipientId);
  };

  const displayMessage = (senderLabel, messageText, isSentByMe) => {
    const li = document.createElement('li');
    li.textContent = `${senderLabel}: ${messageText}`;
    li.classList.add(isSentByMe ? 'sent' : 'received');
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  };

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;
    if (!currentRecipientId) return alert('Selecione um usuário para enviar mensagem.');

    socket.emit('private-message', {
      recipient: String(currentRecipientId),
      message,
      senderId: String(currentUserId),
      senderName: currentUserName
    });

    messageInput.value = '';
  });

  (async () => {
    const ok = await getCurrentUser();
    if (ok) connectToChat();
  })();
});
