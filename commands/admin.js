const config = require('../config');
const { isBotAdmin, isAdmin, getJidWithoutDevice } = require('../lib/functions');
const { addWarn, resetWarn, getUser, getGroup, saveGroup } = require('../lib/database');

module.exports = [
  {
    name: 'kick',
    alias: ['remove'],
    description: 'Remove a member from the group',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, senderJid, mentioned, args, isOwner }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to kick members.' }, { quoted: msg });
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Mention a user to kick.\n\nUsage: .kick @user' }, { quoted: msg });
      await sock.sendMessage(jid, { text: `👢 Kicking @${target.split('@')[0]}...`, mentions: [target] }, { quoted: msg });
      await sock.groupParticipantsUpdate(jid, [target], 'remove');
    },
  },
  {
    name: 'add',
    description: 'Add a member to the group',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, args }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to add members.' }, { quoted: msg });
      if (!args[0]) return sock.sendMessage(jid, { text: '❌ Provide a number.\n\nUsage: .add 923001234567' }, { quoted: msg });
      const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      await sock.groupParticipantsUpdate(jid, [target], 'add');
      await sock.sendMessage(jid, { text: `✅ Added @${target.split('@')[0]} to the group!`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'promote',
    description: 'Promote a member to admin',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, mentioned, args }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to promote members.' }, { quoted: msg });
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Mention a user.\n\nUsage: .promote @user' }, { quoted: msg });
      await sock.groupParticipantsUpdate(jid, [target], 'promote');
      await sock.sendMessage(jid, { text: `⬆️ @${target.split('@')[0]} has been promoted to *Admin*!`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'demote',
    description: 'Demote an admin to member',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, mentioned, args }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to demote members.' }, { quoted: msg });
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Mention a user.\n\nUsage: .demote @user' }, { quoted: msg });
      await sock.groupParticipantsUpdate(jid, [target], 'demote');
      await sock.sendMessage(jid, { text: `⬇️ @${target.split('@')[0]} has been demoted to *Member*!`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'mute',
    description: 'Mute the group (only admins can send)',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to mute the group.' }, { quoted: msg });
      await sock.groupSettingUpdate(jid, 'announcement');
      await sock.sendMessage(jid, { text: '🔇 Group has been *muted*. Only admins can send messages now.' }, { quoted: msg });
    },
  },
  {
    name: 'unmute',
    description: 'Unmute the group',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to unmute the group.' }, { quoted: msg });
      await sock.groupSettingUpdate(jid, 'not_announcement');
      await sock.sendMessage(jid, { text: '🔊 Group has been *unmuted*. All members can send messages now.' }, { quoted: msg });
    },
  },
  {
    name: 'warn',
    description: 'Warn a user',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, mentioned, args, body }) {
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Mention a user.\n\nUsage: .warn @user [reason]' }, { quoted: msg });
      const reason = body.replace(/@\d+/g, '').trim() || 'No reason provided';
      const warns = addWarn(target);
      const text = `⚠️ *Warning!*\n\n👤 User: @${target.split('@')[0]}\n📝 Reason: ${reason}\n🔢 Warnings: ${warns}/3\n\n${warns >= 3 ? '❌ *3 strikes! User has been kicked.*' : ''}`;
      await sock.sendMessage(jid, { text, mentions: [target] }, { quoted: msg });
      if (warns >= 3 && (await isBotAdmin(sock, jid))) {
        await sock.groupParticipantsUpdate(jid, [target], 'remove');
        resetWarn(target);
      }
    },
  },
  {
    name: 'resetwarn',
    alias: ['clearwarn'],
    description: 'Reset warnings for a user',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, mentioned, args }) {
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return sock.sendMessage(jid, { text: '❌ Mention a user.' }, { quoted: msg });
      resetWarn(target);
      await sock.sendMessage(jid, { text: `✅ Warnings reset for @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg });
    },
  },
  {
    name: 'warnlist',
    description: 'Show all warned users',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid }) {
      const { readDb } = require('../lib/database');
      const users = readDb('users');
      const warned = Object.entries(users).filter(([, u]) => u.warnings > 0);
      if (!warned.length) return sock.sendMessage(jid, { text: '✅ No warned users!' }, { quoted: msg });
      const list = warned.map(([jid, u]) => `• @${jid.split('@')[0]} — ${u.warnings} warning(s)`).join('\n');
      await sock.sendMessage(jid, { text: `⚠️ *Warned Users:*\n\n${list}`, mentions: warned.map(([j]) => j) }, { quoted: msg });
    },
  },
  {
    name: 'antilink',
    description: 'Toggle anti-link in group',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, args }) {
      const state = args[0] !== 'off';
      saveGroup(jid, { antiLink: state });
      await sock.sendMessage(jid, { text: `🔗 Anti-Link: *${state ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },
  {
    name: 'antispam',
    description: 'Toggle anti-spam in group',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, args }) {
      const state = args[0] !== 'off';
      saveGroup(jid, { antiSpam: state });
      await sock.sendMessage(jid, { text: `🚫 Anti-Spam: *${state ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },
  {
    name: 'antidelete',
    description: 'Toggle anti-delete in group',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, args }) {
      const state = args[0] !== 'off';
      saveGroup(jid, { antiDelete: state });
      await sock.sendMessage(jid, { text: `🗑️ Anti-Delete: *${state ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },
  {
    name: 'welcome',
    description: 'Toggle welcome messages',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, args }) {
      const state = args[0] !== 'off';
      saveGroup(jid, { welcome: state });
      await sock.sendMessage(jid, { text: `👋 Welcome Messages: *${state ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },
  {
    name: 'goodbye',
    description: 'Toggle goodbye messages',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, args }) {
      const state = args[0] !== 'off';
      saveGroup(jid, { goodbye: state });
      await sock.sendMessage(jid, { text: `👋 Goodbye Messages: *${state ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },
  {
    name: 'tagall',
    alias: ['everyone', 'all'],
    description: 'Tag all group members',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, body }) {
      const meta = await sock.groupMetadata(jid);
      const members = meta.participants;
      const mentions = members.map(p => p.id);
      const text = (body || `📢 *Attention Everyone!*`) + '\n\n' + members.map(p => `@${p.id.split('@')[0]}`).join(' ');
      await sock.sendMessage(jid, { text, mentions }, { quoted: msg });
    },
  },
  {
    name: 'hidetag',
    description: 'Tag all silently (invisible mentions)',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, body }) {
      const meta = await sock.groupMetadata(jid);
      const mentions = meta.participants.map(p => p.id);
      await sock.sendMessage(jid, { text: body || '​', mentions }, { quoted: msg });
    },
  },
  {
    name: 'setdesc',
    description: 'Set group description',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Provide description text.' }, { quoted: msg });
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need admin rights.' }, { quoted: msg });
      await sock.groupUpdateDescription(jid, body);
      await sock.sendMessage(jid, { text: '✅ Group description updated!' }, { quoted: msg });
    },
  },
  {
    name: 'setname',
    description: 'Set group name',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Provide a group name.' }, { quoted: msg });
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need admin rights.' }, { quoted: msg });
      await sock.groupUpdateSubject(jid, body);
      await sock.sendMessage(jid, { text: `✅ Group name set to: *${body}*` }, { quoted: msg });
    },
  },
  {
    name: 'linkgroup',
    alias: ['invite'],
    description: 'Get group invite link',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need admin rights.' }, { quoted: msg });
      const code = await sock.groupInviteCode(jid);
      await sock.sendMessage(jid, { text: `🔗 *Group Invite Link:*\n\nhttps://chat.whatsapp.com/${code}` }, { quoted: msg });
    },
  },
  {
    name: 'revoke',
    description: 'Revoke group invite link',
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, msg, jid }) {
      if (!(await isBotAdmin(sock, jid))) return sock.sendMessage(jid, { text: '❌ I need admin rights.' }, { quoted: msg });
      await sock.groupRevokeInvite(jid);
      const code = await sock.groupInviteCode(jid);
      await sock.sendMessage(jid, { text: `✅ Invite link revoked!\n\n🔗 New link: https://chat.whatsapp.com/${code}` }, { quoted: msg });
    },
  },
];
