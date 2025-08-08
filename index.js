const express = require('express');
const http = require('http');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const commands = new Map();

// تحميل الأوامر من مجلد commands
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const command = require(path.join(commandsPath, file));
    commands.set(command.name, command);
  }
});

let sock = null;
let authInfo = null;

async function startSocket() {
  authInfo = await useMultiFileAuthState('auth_info');

  sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: authInfo.state,
    printQRInTerminal: false, // لن نطبع QR في الطرفية، لأننا نرسله عبر Socket.io
  });

  sock.ev.on('creds.update', authInfo.saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      io.emit('qr', qr);
    }

    if (connection === 'close') {
      if ((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        console.log('انقطع الاتصال، يعاد الاتصال...');
        startSocket();
      } else {
        console.log('تم تسجيل الخروج.');
      }
    } else if (connection === 'open') {
      console.log('✅ تم الاتصال بواتساب!');
      io.emit('paired');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return; // تجاهل رسائل البوت نفسه

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!text) return;

    const commandName = text.trim().toLowerCase();

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        await command.execute(sock, from, msg);
      } catch (error) {
        console.error(`خطأ في تنفيذ الأمر ${commandName}:`, error);
      }
    }
  });
}

startSocket();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
});
