const app = require('./config/express')();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const crypto = require('crypto');

const usuariosOnline = {};

app.get('/_health', (req, res) => res.send('ok'));

io.on('connection', socket => {

  socket.on('registrarId', userId => {
    if (!userId) return;
    usuariosOnline[userId] = socket.id;
    socket.userId = userId;
    socket.emit('onlineUsers', Object.keys(usuariosOnline));
    io.emit('onlineUsers', Object.keys(usuariosOnline));
  });

  socket.on('enviar', ({ para, sala, mensagem }) => {
    if (!mensagem) return;
    if (sala) {
      socket.to(sala).emit('receber', { de: socket.userId, mensagem, privada: false });
      socket.emit('receber', { de: socket.userId, mensagem, privada: false });
    } else if (para) {
      const target = usuariosOnline[para];
      if (target) {
        io.to(target).emit('receber', { de: socket.userId, mensagem, privada: true });
        socket.emit('receber', { de: socket.userId, mensagem, privada: true });
      } else {
        socket.emit('errorMensagem', { msg: 'Usuario não está online' });
      }
    } else {
      io.emit('receber', { de: socket.userId, mensagem, privada: false });
    }
  });

  socket.on('enviarConvite', ({ de, para }) => {
    const target = usuariosOnline[para];
    if (!target) {
      socket.emit('erroConvite', { msg: 'Usuário não está online' });
      return;
    }
    io.to(target).emit('conviteRecebido', { de });
    socket.emit('conviteEnviado', { para });
  });

  socket.on('aceitarConvite', ({ de, para }) => {
    const idFrom = usuariosOnline[de];
    const idTo = usuariosOnline[para];
    if (!idFrom || !idTo) {
      if (idFrom) io.to(idFrom).emit('erroConvite', { msg: 'Outro jogador desconectou' });
      if (idTo) io.to(idTo).emit('erroConvite', { msg: 'Outro jogador desconectou' });
      return;
    }
    const sala = "sala-" + crypto.randomBytes(6).toString('hex');
    io.to(idFrom).emit('conviteAceito', { sala, lado: 'red', oponente: para });
    io.to(idTo).emit('conviteAceito', { sala, lado: 'white', oponente: de });
    const sockFrom = io.sockets.sockets.get(idFrom);
    const sockTo = io.sockets.sockets.get(idTo);
    if (sockFrom) sockFrom.join(sala);
    if (sockTo) sockTo.join(sala);
  });

  socket.on('entrarSala', ({ sala }) => {
    socket.join(sala);
    socket.to(sala).emit('jogadorEntrou', { userId: socket.userId });
  });

  socket.on('movimento', ({ sala, movimento }) => {
    socket.to(sala).emit('movimento', movimento);
  });
  socket.on('enviarConviteVideo', ({ de, para }) => {
    const target = usuariosOnline[para];
    if (!target) {
      socket.emit('erroConvite', { msg: 'Usuário não está online' });
      return;
    }
    io.to(target).emit('conviteVideoRecebido', { de });
    socket.emit('conviteEnviadoVideo', { para });
  });

  socket.on('aceitarConviteVideo', ({ de, para }) => {
    const idFrom = usuariosOnline[de];
    const idTo = usuariosOnline[para];
    if (!idFrom || !idTo) {
      if (idFrom) io.to(idFrom).emit('erroConvite', { msg: 'Outro usuário desconectou' });
      if (idTo) io.to(idTo).emit('erroConvite', { msg: 'Outro usuário desconectou' });
      return;
    }

    const sala = "video-" + crypto.randomBytes(6).toString('hex');

    io.to(idFrom).emit('conviteVideoAceito', { sala });
    io.to(idTo).emit('conviteVideoAceito', { sala });

    const sockFrom = io.sockets.sockets.get(idFrom);
    const sockTo = io.sockets.sockets.get(idTo);
    if (sockFrom) sockFrom.join(sala);
    if (sockTo) sockTo.join(sala);
  });

  socket.on('joinCall', ({ sala }) => {
    if (!sala) return;
    socket.join(sala);
    socket.to(sala).emit('peer-joined', { id: socket.id });
  });

  socket.on('webrtc-offer', ({ sala, offer }) => {
    socket.to(sala).emit('webrtc-offer', { from: socket.id, offer });
  });
  socket.on('webrtc-answer', ({ sala, answer }) => {
    socket.to(sala).emit('webrtc-answer', { from: socket.id, answer });
  });
  socket.on('webrtc-candidate', ({ sala, candidate }) => {
    socket.to(sala).emit('webrtc-candidate', { from: socket.id, candidate });
  });

  socket.on('leaveCall', ({ sala }) => {
    socket.leave(sala);
    socket.to(sala).emit('peer-left', { id: socket.id });
  });
  socket.on('disconnect', () => {
    if (socket.userId) {
      delete usuariosOnline[socket.userId];
      io.emit('onlineUsers', Object.keys(usuariosOnline));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});
