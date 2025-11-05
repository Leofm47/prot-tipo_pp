// chat_server.js
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" } // ajuste conforme necessário para produção
});

const PORT = 3000;

// mapa userId -> { socketId, name }
const onlineUsers = new Map();

// mensagens: chave "smallerId:largerId" => [{ senderId, senderName, message, ts }]
const messages = {};

function chatKey(a, b) {
  const [x,y] = [String(a), String(b)].sort();
  return `${x}:${y}`;
}

io.on('connection', (socket) => {
  console.log('socket conectado', socket.id);

  // autentica usuário (front envia { id, name })
  socket.on('authenticate', ({ id, name }) => {
    if (!id) return;
    onlineUsers.set(String(id), { socketId: socket.id, name: name || String(id) });
    console.log('autenticado', id, name);
    // atualiza lista pra todo mundo
    broadcastUserList();
  });

  socket.on('load-history', (otherId, cb) => {
    // otherId é o id do usuário com quem quero ver o histórico
    // encontramos qual é o id do solicitante
    const requesterEntry = [...onlineUsers.entries()].find(([,v]) => v.socketId === socket.id);
    const requesterId = requesterEntry ? requesterEntry[0] : null;
    if (!requesterId) {
      if (typeof cb === 'function') cb([]);
      return;
    }
    const key = chatKey(requesterId, otherId);
    const hist = messages[key] || [];
    // envia só pra quem pediu (resposta via callback ou evento)
    socket.emit('history', hist);
    if (typeof cb === 'function') cb(hist);
  });

  socket.on('private-message', ({ recipient, message, senderId, senderName }) => {
    if (!recipient || !message) return;
    const from = String(senderId || (findUserIdBySocket(socket.id)) || 'unknown');
    const fromName = senderName || (onlineUsers.get(from) && onlineUsers.get(from).name) || from;

    // salvar no histórico
    const key = chatKey(from, recipient);
    messages[key] = messages[key] || [];
    const entry = { senderId: from, senderName: fromName, message, ts: Date.now() };
    messages[key].push(entry);

    // enviar pra recipient se online
    const rec = onlineUsers.get(String(recipient));
    if (rec && rec.socketId) {
      io.to(rec.socketId).emit('private-message', { sender: from, senderName: fromName, message });
    }
    // também envia pro próprio emissor (para renderizar na UI local)
    socket.emit('private-message', { sender: from, senderName: fromName, message });
  });

  socket.on('disconnect', () => {
    // remove usuário do onlineUsers
    const entry = [...onlineUsers.entries()].find(([,v]) => v.socketId === socket.id);
    if (entry) {
      onlineUsers.delete(entry[0]);
      broadcastUserList();
    }
    console.log('socket desconectado', socket.id);
  });
});

function findUserIdBySocket(socketId) {
  const entry = [...onlineUsers.entries()].find(([,v]) => v.socketId === socketId);
  return entry ? entry[0] : null;
}

function broadcastUserList() {
  const list = [...onlineUsers.entries()].map(([id, v]) => ({ id, name: v.name }));
  io.emit('update-user-list', list);
}

server.listen(PORT, () => {
  console.log(`Chat server rodando em http://localhost:${PORT}`);
});
