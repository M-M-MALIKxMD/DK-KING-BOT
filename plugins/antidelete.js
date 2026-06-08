// ─── Anti-Delete Plugin ───────────────────────────────────────────────────────
// This plugin hooks into the message delete event and resends deleted messages.
// Enabled globally via config.antiDelete or per-group via groupData.antiDelete.

const config = require('../config');
const { getDeletedMessage, getGroup } = require('../lib/database');
const logger = require('../lib/logger');

function registerAntiDelete(sock) {
  sock.ev.on('messages.delete', async (item) => {
    try {
      if (!config.antiDelete) return;

      const keys = item.keys || [];
      for (const key of keys) {
        const jid = key.remoteJid;
        if (!jid) continue;

        // Check per-group setting
        if (jid.endsWith('@g.us')) {
          const groupData = getGroup(jid);
          if (!groupData.antiDelete && !config.antiDelete) continue;
        }

        const deleted = getDeletedMessage(key.id);
        if (!deleted || !deleted.message) continue;

        const sender = deleted.key?.participant || deleted.key?.remoteJid || 'Unknown';
        const senderNum = sender.split('@')[0];

        await sock.sendMessage(jid, {
          text: `🗑️ *Anti-Delete Alert!*\n\n👤 @${senderNum} deleted a message!\n\n_Below is the deleted content:_`,
          mentions: [sender],
        });

        // Resend the deleted message
        const forward = { ...deleted, key: { ...deleted.key, fromMe: false } };
        await sock.sendMessage(jid, { forward });
      }
    } catch (err) {
      logger.error('Anti-delete error:', err.message);
    }
  });
}

module.exports = { registerAntiDelete };
