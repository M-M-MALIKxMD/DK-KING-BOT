const config = require('../config');
const { fetchBuffer } = require('../lib/functions');
const axios = require('axios');

module.exports = [
  {
    name: 'steal',
    alias: ['takesticker'],
    description: 'Steal a sticker and rebrand it',
    async execute({ sock, msg, jid, quoted, args }) {
      const q = quoted?.message || msg.message;
      if (!q?.stickerMessage) return sock.sendMessage(jid, { text: '❌ Reply to a sticker.\n\nUsage: .steal (reply to sticker)' }, { quoted: msg });
      const packName = args[0] || config.botName;
      const authorName = args[1] || config.ownerName;
      try {
        const { default: Sticker, StickerTypes } = require('wa-sticker-formatter');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const sticker = new Sticker(buffer, {
          pack: packName,
          author: authorName,
          type: StickerTypes.FULL,
          quality: 50,
        });
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Steal failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'stickerinfo',
    alias: ['sinfo'],
    description: 'Get metadata of a sticker',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.stickerMessage) return sock.sendMessage(jid, { text: '❌ Reply to a sticker.' }, { quoted: msg });
      const s = q.stickerMessage;
      await sock.sendMessage(jid, {
        text: `🎭 *Sticker Info*\n\n📦 Pack: ${s.packname || 'Unknown'}\n✍️ Author: ${s.author || 'Unknown'}\n🆔 Pack ID: ${s.packId || 'N/A'}\n📺 Animated: ${s.isAnimated ? 'Yes' : 'No'}\n🎮 Avatar: ${s.isAvatar ? 'Yes' : 'No'}`,
      }, { quoted: msg });
    },
  },
  {
    name: 'addsticker',
    alias: ['stickeradd'],
    description: 'Add sticker to pack with custom name',
    async execute({ sock, msg, jid, quoted, args }) {
      const q = quoted?.message || msg.message;
      const hasMedia = q?.imageMessage || q?.videoMessage || q?.stickerMessage;
      if (!hasMedia) return sock.sendMessage(jid, { text: '❌ Reply to an image, video, or sticker.\n\nUsage: .addsticker PackName | AuthorName (reply to media)' }, { quoted: msg });
      const parts = args.join(' ').split('|').map(s => s.trim());
      const packName = parts[0] || config.botName;
      const authorName = parts[1] || config.ownerName;
      try {
        const { default: Sticker, StickerTypes } = require('wa-sticker-formatter');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const sticker = new Sticker(buffer, {
          pack: packName,
          author: authorName,
          type: StickerTypes.FULL,
          quality: 50,
        });
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
        await sock.sendMessage(jid, { text: `✅ Sticker added!\n📦 Pack: ${packName}\n✍️ Author: ${authorName}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'emojimix',
    alias: ['mixemoji'],
    description: 'Mix two emojis together',
    async execute({ sock, msg, jid, args }) {
      const [e1, e2] = args;
      if (!e1 || !e2) return sock.sendMessage(jid, { text: '❌ Usage: .emojimix 😂 🔥' }, { quoted: msg });
      const getCodePoint = e => [...e].map(c => c.codePointAt(0).toString(16)).join('-');
      const c1 = getCodePoint(e1);
      const c2 = getCodePoint(e2);
      try {
        const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/${c1}/${c1}_${c2}.png`;
        const buffer = await fetchBuffer(url);
        const { default: Sticker, StickerTypes } = require('wa-sticker-formatter');
        const sticker = new Sticker(buffer, {
          pack: config.botName,
          author: 'Emoji Kitchen',
          type: StickerTypes.FULL,
          quality: 50,
        });
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ Could not mix ${e1} + ${e2}. Try different emojis!` }, { quoted: msg });
      }
    },
  },
  {
    name: 'text2sticker',
    alias: ['textsticker', 'ts'],
    description: 'Convert text to a sticker',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .text2sticker Hello World!' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Creating text sticker...' }, { quoted: msg });
      try {
        const Jimp = require('jimp');
        const image = new Jimp(512, 512, 0x000000ff);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        image.print(font, 10, 200, { text: body.substring(0, 20), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 492, 112);
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        const { default: Sticker, StickerTypes } = require('wa-sticker-formatter');
        const sticker = new Sticker(buffer, {
          pack: config.botName,
          author: config.ownerName,
          type: StickerTypes.FULL,
          quality: 50,
        });
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Text sticker failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'stickerpack',
    description: 'Create a sticker pack from multiple images',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, {
        text: `🎭 *Sticker Pack Builder*\n\nSend multiple images one by one and use *.sticker* on each to build your sticker pack!\n\n📦 Pack Name: ${config.botName}\n✍️ Author: ${config.ownerName}\n\n_Tip: Use .steal to rebrand any existing sticker._`,
      }, { quoted: msg });
    },
  },
];
