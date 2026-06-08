const config = require('../config');
const { sleep } = require('../lib/functions');
const { banUser, unbanUser, readDb, writeDb } = require('../lib/database');

module.exports = [
  {
    name: 'broadcast',
    alias: ['bc'],
    description: 'Broadcast a message to all groups',
    ownerOnly: true,
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '📢 Please provide a message to broadcast.\n\nUsage: .broadcast <message>' }, { quoted: msg });
      const groups = Object.keys(await sock.groupFetchAllParticipating());
      let sent = 0;
      await sock.sendMessage(jid, { text: `📢 Broadcasting to ${groups.length} groups...` }, { quoted: msg });
      for (const g of groups) {
        try {
          await sock.sendMessage(g, { text: `📢 *Broadcast from ${config.ownerName}*\n\n${body}\n\n_— ${config.botName}_` });
          sent++;
          await sleep(1000);
        } catch {}
      }
      await sock.sendMessage(jid, { text: `✅ Broadcast sent to ${sent}/${groups.length} groups!` }, { quoted: msg });
    },
  },
  {
    name: 'ban',
    description: 'Ban a user from using the bot',
    ownerOnly: true,
    async execute({ sock, msg, jid, args, mentioned }) {
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Please mention or provide a user number.\n\nUsage: .ban @user' }, { quoted: msg });
      banUser(target);
      await sock.sendMessage(jid, { text: `🚫 User @${target.split('@')[0]} has been *banned* from using the bot.`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'unban',
    description: 'Unban a user',
    ownerOnly: true,
    async execute({ sock, msg, jid, args, mentioned }) {
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Please mention a user.\n\nUsage: .unban @user' }, { quoted: msg });
      unbanUser(target);
      await sock.sendMessage(jid, { text: `✅ User @${target.split('@')[0]} has been *unbanned*.`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'setprefix',
    description: 'Change the bot prefix',
    ownerOnly: true,
    async execute({ sock, msg, jid, args }) {
      if (!args[0]) return sock.sendMessage(jid, { text: '❌ Please provide a new prefix.\n\nUsage: .setprefix !' }, { quoted: msg });
      config.prefix = args[0];
      await sock.sendMessage(jid, { text: `✅ Prefix changed to: *${args[0]}*` }, { quoted: msg });
    },
  },
  {
    name: 'setmode',
    description: 'Set bot mode (public/private)',
    ownerOnly: true,
    async execute({ sock, msg, jid, args }) {
      const mode = args[0]?.toLowerCase();
      if (!['public', 'private'].includes(mode)) return sock.sendMessage(jid, { text: '❌ Mode must be *public* or *private*.\n\nUsage: .setmode public' }, { quoted: msg });
      config.mode = mode;
      await sock.sendMessage(jid, { text: `✅ Bot mode set to: *${mode}*` }, { quoted: msg });
    },
  },
  {
    name: 'join',
    description: 'Join a group via invite link',
    ownerOnly: true,
    async execute({ sock, msg, jid, args }) {
      const link = args[0];
      if (!link) return sock.sendMessage(jid, { text: '❌ Provide a group invite link.\n\nUsage: .join https://chat.whatsapp.com/...' }, { quoted: msg });
      try {
        const code = link.split('chat.whatsapp.com/')[1];
        await sock.groupAcceptInvite(code);
        await sock.sendMessage(jid, { text: '✅ Successfully joined the group!' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed to join: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'leave',
    description: 'Leave a group',
    ownerOnly: true,
    groupOnly: true,
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `👋 Goodbye! ${config.botName} is leaving this group.` }, { quoted: msg });
      await sleep(2000);
      await sock.groupLeave(jid);
    },
  },
  {
    name: 'restart',
    description: 'Restart the bot',
    ownerOnly: true,
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: '🔄 Restarting bot...' }, { quoted: msg });
      await sleep(2000);
      process.exit(0);
    },
  },
  {
    name: 'shutdown',
    alias: ['stop'],
    description: 'Shutdown the bot',
    ownerOnly: true,
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `⛔ *${config.botName}* is shutting down.\n\nGoodbye!` }, { quoted: msg });
      await sleep(2000);
      process.exit(1);
    },
  },
  {
    name: 'block',
    description: 'Block a user',
    ownerOnly: true,
    async execute({ sock, msg, jid, mentioned, args }) {
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Mention a user to block.' }, { quoted: msg });
      await sock.updateBlockStatus(target, 'block');
      await sock.sendMessage(jid, { text: `🚫 Blocked @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'unblock',
    description: 'Unblock a user',
    ownerOnly: true,
    async execute({ sock, msg, jid, mentioned, args }) {
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Mention a user to unblock.' }, { quoted: msg });
      await sock.updateBlockStatus(target, 'unblock');
      await sock.sendMessage(jid, { text: `✅ Unblocked @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'clearchat',
    description: 'Clear a chat',
    ownerOnly: true,
    async execute({ sock, msg, jid }) {
      await sock.chatModify({ clear: { messages: [{ id: msg.key.id, fromMe: false, timestamp: msg.messageTimestamp }] } }, jid);
      await sock.sendMessage(jid, { text: '🧹 Chat cleared!' }, { quoted: msg });
    },
  },
  {
    name: 'eval',
    alias: ['exec'],
    description: 'Evaluate JavaScript code (dangerous!)',
    ownerOnly: true,
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Provide code to evaluate.' }, { quoted: msg });
      try {
        let result = eval(body);
        if (typeof result !== 'string') result = JSON.stringify(result, null, 2);
        await sock.sendMessage(jid, { text: `✅ Result:\n\`\`\`\n${String(result).slice(0, 3000)}\n\`\`\`` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Error:\n${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'listgroups',
    description: 'List all groups bot is in',
    ownerOnly: true,
    async execute({ sock, msg, jid }) {
      const groups = await sock.groupFetchAllParticipating();
      const list = Object.values(groups).map((g, i) => `${i + 1}. ${g.subject} (${g.participants.length} members)`).join('\n');
      await sock.sendMessage(jid, { text: `📋 *Bot Groups (${Object.keys(groups).length}):*\n\n${list}` }, { quoted: msg });
    },
  },
  {
    name: 'sendmsg',
    description: 'Send a message to any number/group',
    ownerOnly: true,
    async execute({ sock, msg, jid, args, body }) {
      const target = args[0];
      const message = args.slice(1).join(' ');
      if (!target || !message) return sock.sendMessage(jid, { text: '❌ Usage: .sendmsg <number/groupid> <message>' }, { quoted: msg });
      const targetJid = target.includes('@') ? target : target + '@s.whatsapp.net';
      await sock.sendMessage(targetJid, { text: message });
      await sock.sendMessage(jid, { text: `✅ Message sent to ${target}` }, { quoted: msg });
    },
  },
  {
    name: 'autoreact',
    description: 'Toggle auto react',
    ownerOnly: true,
    async execute({ sock, msg, jid, args }) {
      const mode = args[0]?.toLowerCase();
      if (mode === 'off') { config.autoReact = false; return sock.sendMessage(jid, { text: '✅ Auto React: *OFF*' }, { quoted: msg }); }
      if (mode === 'random') { config.autoReact = true; config.reactMode = 'random'; return sock.sendMessage(jid, { text: '✅ Auto React: *Random Mode*' }, { quoted: msg }); }
      if (mode === 'fixed') { config.autoReact = true; config.reactMode = 'fixed'; return sock.sendMessage(jid, { text: `✅ Auto React: *Fixed Mode* (${config.fixedReact})` }, { quoted: msg }); }
      await sock.sendMessage(jid, { text: `Current auto react: *${config.autoReact ? config.reactMode : 'OFF'}*\n\nUsage: .autoreact [random|fixed|off]` }, { quoted: msg });
    },
  },
  {
    name: 'autoread',
    description: 'Toggle auto read',
    ownerOnly: true,
    async execute({ sock, msg, jid, args }) {
      config.autoRead = args[0] !== 'off';
      await sock.sendMessage(jid, { text: `✅ Auto Read: *${config.autoRead ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },
];
