const config = require('./config');
const logger = require('./lib/logger');
const { isGroup, isAdmin, isBotAdmin, getJidWithoutDevice, pickRandom } = require('./lib/functions');
const { getUser, saveUser, getGroup, checkSpam, isUserBanned, storeMessage } = require('./lib/database');
const path = require('path');
const fs = require('fs');

// ─── Load All Commands ────────────────────────────────────────────────────────
const commandsDir = path.join(__dirname, 'commands');
const commands = new Map();

function loadCommands() {
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const cmds = require(path.join(commandsDir, file));
      if (Array.isArray(cmds)) {
        for (const cmd of cmds) {
          if (cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
          if (cmd.alias) cmd.alias.forEach(a => commands.set(a.toLowerCase(), cmd));
        }
      }
    } catch (err) {
      logger.error(`Failed to load ${file}: ${err.message}`);
    }
  }
  logger.success(`Loaded ${commands.size} commands from ${files.length} files`);
}
loadCommands();

// ─── Extract Message Text ─────────────────────────────────────────────────────
function getMessageText(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  );
}

function getMentioned(msg) {
  return (
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    msg.message?.imageMessage?.contextInfo?.mentionedJid ||
    []
  );
}

function getQuoted(msg) {
  const ctx =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.stickerMessage?.contextInfo ||
    null;
  if (!ctx?.quotedMessage) return null;
  return {
    message: ctx.quotedMessage,
    key: {
      id: ctx.stanzaId,
      remoteJid: msg.key.remoteJid,
      fromMe: ctx.participant === msg.key.remoteJid,
      participant: ctx.participant,
    },
  };
}

function getMessageType(msg) {
  const m = msg.message;
  if (!m) return null;
  const types = ['conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage',
    'audioMessage', 'documentMessage', 'stickerMessage', 'contactMessage',
    'locationMessage', 'reactionMessage', 'viewOnceMessage'];
  return types.find(t => m[t]) || null;
}

// ─── Main Message Handler ─────────────────────────────────────────────────────
async function messageHandler(sock, msg, store) {
  if (!msg.message) return;
  if (msg.key.fromMe) return;

  const jid = msg.key.remoteJid;
  if (!jid) return;

  const isGrp = isGroup(jid);
  const senderJid = isGrp ? msg.key.participant : jid;
  const senderNum = senderJid?.split('@')[0] || '';
  const isOwner = senderNum === config.ownerNumber || config.ownerNumber === senderJid?.split(':')[0];
  const text = getMessageText(msg);
  const prefix = config.prefix;

  // ─── Store messages for anti-delete ─────────────────────────────────────────
  storeMessage(msg.key.id, msg);

  // ─── Auto Read ───────────────────────────────────────────────────────────────
  if (config.autoRead) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // ─── Auto React ──────────────────────────────────────────────────────────────
  if (config.autoReact && text) {
    const emoji = config.reactMode === 'fixed'
      ? config.fixedReact
      : pickRandom(config.reactions);
    await sock.sendMessage(jid, { react: { text: emoji, key: msg.key } }).catch(() => {});
  }

  // ─── View Once Reader ────────────────────────────────────────────────────────
  if (config.viewOnce && msg.message?.viewOnceMessage) {
    const inner = msg.message.viewOnceMessage?.message;
    if (inner) {
      await sock.sendMessage(senderJid, {
        text: `👁 *View Once Captured*\n\n_From: @${senderNum}_`,
      }).catch(() => {});
      const fwdMsg = { ...msg, message: inner };
      await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', fwdMsg).catch(() => {});
    }
  }

  // ─── Ban Check ───────────────────────────────────────────────────────────────
  if (!isOwner && isUserBanned(senderJid)) return;

  // ─── Anti Spam ───────────────────────────────────────────────────────────────
  if (!isOwner && config.antiSpam && isGrp) {
    if (checkSpam(senderJid, config.spamLimit, config.spamInterval)) {
      return await sock.sendMessage(jid, {
        text: `⚠️ @${senderNum} slow down! You're sending messages too fast.`,
        mentions: [senderJid],
      }).catch(() => {});
    }
  }

  // ─── Anti Link ───────────────────────────────────────────────────────────────
  if (isGrp && config.antiLink) {
    const { getGroup } = require('./lib/database');
    const groupData = getGroup(jid);
    if (groupData.antiLink && !isOwner) {
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi;
      if (urlRegex.test(text)) {
        const adminCheck = await isAdmin(sock, jid, senderJid);
        if (!adminCheck) {
          await sock.sendMessage(jid, { delete: msg.key }).catch(() => {});
          await sock.sendMessage(jid, {
            text: `🚫 @${senderNum} Links are not allowed in this group!`,
            mentions: [senderJid],
          }).catch(() => {});
        }
      }
    }
  }

  // ─── Command Parser ───────────────────────────────────────────────────────────
  if (!text.startsWith(prefix)) return;

  const args = text.slice(prefix.length).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();
  const body = args.join(' ');

  const cmd = commands.get(cmdName);
  if (!cmd) return;

  // ─── Access Control ───────────────────────────────────────────────────────────
  if (cmd.ownerOnly && !isOwner) {
    return sock.sendMessage(jid, { text: `❌ This command is for the *Owner* only!` }, { quoted: msg });
  }

  if (cmd.adminOnly && isGrp) {
    const adminCheck = await isAdmin(sock, jid, senderJid);
    if (!adminCheck && !isOwner) {
      return sock.sendMessage(jid, { text: `❌ This command is for *Admins* only!` }, { quoted: msg });
    }
  }

  if (cmd.groupOnly && !isGrp) {
    return sock.sendMessage(jid, { text: `❌ This command can only be used in *Groups*!` }, { quoted: msg });
  }

  if (cmd.privateOnly && isGrp) {
    return sock.sendMessage(jid, { text: `❌ This command can only be used in *Private Chat*!` }, { quoted: msg });
  }

  // ─── Execute Command ──────────────────────────────────────────────────────────
  try {
    logger.bot(cmdName, `${senderNum} in ${isGrp ? 'group' : 'pm'}`);
    await cmd.execute({
      sock, msg, jid, senderJid, senderNum, isOwner, isGrp,
      args, body, text, prefix, store,
      quoted: getQuoted(msg),
      mentioned: getMentioned(msg),
      messageType: getMessageType(msg),
    });
  } catch (err) {
    logger.error(`Command ${cmdName} error: ${err.message}`);
    await sock.sendMessage(jid, {
      text: `❌ *Error:* ${err.message}\n\n_Please try again or contact the owner._`,
    }, { quoted: msg }).catch(() => {});
  }
}

module.exports = { messageHandler, commands };
