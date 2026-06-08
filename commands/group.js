const config = require('../config');

module.exports = [
  {
    name: 'groupinfo',
    alias: ['ginfo', 'gc'],
    description: 'Show group information',
    groupOnly: true,
    async execute({ sock, msg, jid }) {
      const meta = await sock.groupMetadata(jid);
      const admins = meta.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`).join(', ');
      const text = `╔══════════════════════╗
║   📋 *GROUP INFO*       ║
╚══════════════════════╝

📌 *Name:* ${meta.subject}
🆔 *ID:* ${jid}
👥 *Members:* ${meta.participants.length}
👑 *Created by:* @${meta.owner?.split('@')[0] || 'Unknown'}
📅 *Created:* ${new Date(meta.creation * 1000).toLocaleDateString()}
📝 *Description:*\n${meta.desc || 'No description set.'}

🛡️ *Admins:* ${admins || 'None'}`;
      await sock.sendMessage(jid, {
        text,
        mentions: meta.participants.filter(p => p.admin).map(p => p.id),
      }, { quoted: msg });
    },
  },
  {
    name: 'members',
    alias: ['participants'],
    description: 'List all group members',
    groupOnly: true,
    async execute({ sock, msg, jid }) {
      const meta = await sock.groupMetadata(jid);
      const list = meta.participants.map((p, i) => `${i + 1}. @${p.id.split('@')[0]}${p.admin ? ' 👑' : ''}`).join('\n');
      await sock.sendMessage(jid, {
        text: `👥 *${meta.subject} Members (${meta.participants.length}):*\n\n${list}`,
        mentions: meta.participants.map(p => p.id),
      }, { quoted: msg });
    },
  },
  {
    name: 'admins',
    description: 'List all group admins',
    groupOnly: true,
    async execute({ sock, msg, jid }) {
      const meta = await sock.groupMetadata(jid);
      const admins = meta.participants.filter(p => p.admin);
      const list = admins.map((p, i) => `${i + 1}. @${p.id.split('@')[0]} (${p.admin})`).join('\n');
      await sock.sendMessage(jid, {
        text: `👑 *Group Admins (${admins.length}):*\n\n${list}`,
        mentions: admins.map(p => p.id),
      }, { quoted: msg });
    },
  },
  {
    name: 'poll',
    description: 'Create a poll',
    groupOnly: true,
    async execute({ sock, msg, jid, body }) {
      const parts = body.split('|').map(s => s.trim());
      if (parts.length < 3) return sock.sendMessage(jid, { text: '❌ Usage: .poll Question | Option1 | Option2 | Option3' }, { quoted: msg });
      const [question, ...options] = parts;
      await sock.sendMessage(jid, {
        poll: { name: question, values: options, selectableCount: 1 },
      }, { quoted: msg });
    },
  },
  {
    name: 'setwelcome',
    description: 'Set custom welcome message',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .setwelcome Welcome @user to @group!' }, { quoted: msg });
      const { saveGroup } = require('../lib/database');
      saveGroup(jid, { welcomeMsg: body, welcome: true });
      await sock.sendMessage(jid, { text: `✅ Welcome message set:\n\n${body}` }, { quoted: msg });
    },
  },
  {
    name: 'setgoodbye',
    description: 'Set custom goodbye message',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .setgoodbye Goodbye @user!' }, { quoted: msg });
      const { saveGroup } = require('../lib/database');
      saveGroup(jid, { goodbyeMsg: body, goodbye: true });
      await sock.sendMessage(jid, { text: `✅ Goodbye message set:\n\n${body}` }, { quoted: msg });
    },
  },
  {
    name: 'setppgc',
    alias: ['setgrouppp'],
    description: 'Set group profile picture',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, quoted }) {
      const { isBotAdmin, fetchBuffer } = require('../lib/functions');
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need admin rights.' }, { quoted: msg });
      const q = quoted?.message?.imageMessage || msg.message?.imageMessage;
      if (!q) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      const buffer = await sock.downloadMediaMessage(quoted || msg);
      await sock.updateProfilePicture(jid, buffer);
      await sock.sendMessage(jid, { text: '✅ Group profile picture updated!' }, { quoted: msg });
    },
  },
];
