const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto,
  getAggregateVotesInPollMessage,
  makeCacheableSignalKeyStore,
  generateWAMessage,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const logger = require('./lib/logger');
const config = require('./config');
const { messageHandler } = require('./handler');

const store = makeInMemoryStore({
  logger: pino({ level: 'silent' }),
});

async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Using WA v${version.join('.')} (latest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !config.sessionId,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser: ['MARCO MALIK MD', 'Chrome', '120.0.0'],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  store?.bind(sock.ev);

  // ─── Connection Updates ──────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn(`Connection closed. Status: ${statusCode}. Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(() => connectBot(), 5000);
      } else {
        logger.error('Logged out. Please delete session folder and re-scan QR.');
        process.exit(1);
      }
    } else if (connection === 'open') {
      logger.success(`✅ Connected as ${sock.user?.name || sock.user?.id}`);
      await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, {
        text: `╔═══════════════════════╗\n║  🤖 *MARCO MALIK MD*  ║\n╚═══════════════════════╝\n\n✅ Bot is now *ONLINE*!\n\n📌 *Owner:* ${config.ownerName}\n🔧 *Version:* v${config.version}\n⚡ *Status:* Active\n\n_${config.botName} is ready to serve!_`,
      }).catch(() => {});
    }
  });

  // ─── Save Credentials ────────────────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ─── Messages ────────────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      try {
        await messageHandler(sock, msg, store);
      } catch (err) {
        logger.error('Handler error:', err.message);
      }
    }
  });

  // ─── Group Updates ───────────────────────────────────────────────────────────
  sock.ev.on('group-participants.update', async (event) => {
    try {
      const { id: groupJid, participants, action } = event;
      const { getGroup } = require('./lib/database');
      const groupData = getGroup(groupJid);

      if (action === 'add' && groupData.welcome) {
        const meta = await sock.groupMetadata(groupJid);
        for (const participant of participants) {
          const num = participant.split('@')[0];
          await sock.sendMessage(groupJid, {
            text: `✨ *Welcome to ${meta.subject}!*\n\n👋 Hey @${num}, glad you're here!\n\n📌 Please read the group rules and enjoy your stay.\n\n_— ${config.botName}_`,
            mentions: [participant],
          });
        }
      }

      if (action === 'remove' && groupData.goodbye) {
        for (const participant of participants) {
          const num = participant.split('@')[0];
          await sock.sendMessage(groupJid, {
            text: `👋 *Goodbye!*\n\n@${num} has left the group.\n\n_Hope to see you again!_`,
            mentions: [participant],
          });
        }
      }
    } catch (err) {
      logger.error('Group update error:', err.message);
    }
  });

  // ─── Auto Status View ────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.remoteJid === 'status@broadcast') {
        if (config.autoStatusView) {
          await sock.readMessages([msg.key]).catch(() => {});
        }
        if (config.autoStatusReply && msg.key.participant) {
          await sock.sendMessage(
            msg.key.participant,
            { text: config.statusReplyMessage },
            { quoted: msg }
          ).catch(() => {});
        }
      }
    }
  });

  // ─── Call Rejection ──────────────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (config.antiCall && call.status === 'offer') {
        await sock.rejectCall(call.id, call.from).catch(() => {});
        await sock.sendMessage(call.from, {
          text: `❌ *Calls are disabled!*\n\nSorry, I don't accept calls. Please message me instead.\n\n_— ${config.botName}_`,
        }).catch(() => {});
      }
    }
  });

  return sock;
}

module.exports = { connectBot };
