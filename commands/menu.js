const config = require('../config');
const { runtime } = require('../lib/functions');

module.exports = [
  {
    name: 'menu',
    alias: ['help', 'start', 'bot'],
    description: 'Show the main command menu',
    category: 'General',
    async execute({ sock, msg, jid, isOwner }) {
      const uptime = runtime(process.uptime());
      const menuText = `
╔══════════════════════════════════╗
║  🤖  *MARCO MALIK MD*  v2.0.0   ║
╚══════════════════════════════════╝

┌─────────────────────────────────
│  ⚙️ *BOT INFO*
├─────────────────────────────────
│ 👑 Owner   : ${config.ownerName}
│ 🏷️ Prefix  : ${config.prefix}
│ ⏱️ Uptime  : ${uptime}
│ 📡 Mode    : ${config.mode}
└─────────────────────────────────

┌─────────────────────────────────
│  👑 *OWNER COMMANDS*
├─────────────────────────────────
│ ${config.prefix}broadcast • ${config.prefix}ban • ${config.prefix}unban
│ ${config.prefix}setprefix • ${config.prefix}setmode
│ ${config.prefix}restart • ${config.prefix}shutdown
│ ${config.prefix}join • ${config.prefix}leave
│ ${config.prefix}block • ${config.prefix}unblock
│ ${config.prefix}clearchat • ${config.prefix}eval
└─────────────────────────────────

┌─────────────────────────────────
│  🛡️ *ADMIN COMMANDS*
├─────────────────────────────────
│ ${config.prefix}kick • ${config.prefix}add • ${config.prefix}promote
│ ${config.prefix}demote • ${config.prefix}mute • ${config.prefix}unmute
│ ${config.prefix}warn • ${config.prefix}warnlist • ${config.prefix}resetwarn
│ ${config.prefix}antilink • ${config.prefix}antispam
│ ${config.prefix}antidelete • ${config.prefix}welcome
│ ${config.prefix}goodbye • ${config.prefix}setwelcome
│ ${config.prefix}setgoodbye • ${config.prefix}tagall
│ ${config.prefix}linkgroup • ${config.prefix}setdesc
│ ${config.prefix}setname • ${config.prefix}setppgc
└─────────────────────────────────

┌─────────────────────────────────
│  👥 *GROUP COMMANDS*
├─────────────────────────────────
│ ${config.prefix}groupinfo • ${config.prefix}members
│ ${config.prefix}admins • ${config.prefix}invite
│ ${config.prefix}revoke • ${config.prefix}poll
│ ${config.prefix}everyone • ${config.prefix}hidetag
└─────────────────────────────────

┌─────────────────────────────────
│  🎮 *FUN COMMANDS*
├─────────────────────────────────
│ ${config.prefix}joke • ${config.prefix}fact • ${config.prefix}quote
│ ${config.prefix}dare • ${config.prefix}truth • ${config.prefix}roast
│ ${config.prefix}ship • ${config.prefix}love • ${config.prefix}rate
│ ${config.prefix}roll • ${config.prefix}flip • ${config.prefix}8ball
│ ${config.prefix}tictactoe • ${config.prefix}guess
│ ${config.prefix}rizz • ${config.prefix}pickup
│ ${config.prefix}wyr • ${config.prefix}nhie
│ ${config.prefix}compliment • ${config.prefix}insult
│ ${config.prefix}horoscope • ${config.prefix}meme
└─────────────────────────────────

┌─────────────────────────────────
│  🔧 *UTILITY COMMANDS*
├─────────────────────────────────
│ ${config.prefix}ping • ${config.prefix}uptime • ${config.prefix}info
│ ${config.prefix}calc • ${config.prefix}weather • ${config.prefix}time
│ ${config.prefix}translate • ${config.prefix}base64
│ ${config.prefix}qr • ${config.prefix}ss • ${config.prefix}img2url
│ ${config.prefix}shorturl • ${config.prefix}expandurl
│ ${config.prefix}ip • ${config.prefix}whois • ${config.prefix}currency
│ ${config.prefix}password • ${config.prefix}hash
│ ${config.prefix}color • ${config.prefix}binary
│ ${config.prefix}morse • ${config.prefix}ascii
│ ${config.prefix}encode • ${config.prefix}decode
│ ${config.prefix}lorem • ${config.prefix}uuid
│ ${config.prefix}urlencode • ${config.prefix}urldecode
│ ${config.prefix}countwords • ${config.prefix}reverse
└─────────────────────────────────

┌─────────────────────────────────
│  🤖 *AI COMMANDS*
├─────────────────────────────────
│ ${config.prefix}ai • ${config.prefix}gpt • ${config.prefix}gemini
│ ${config.prefix}chatgpt • ${config.prefix}imagine
│ ${config.prefix}dalle • ${config.prefix}aisticker
│ ${config.prefix}marco • ${config.prefix}waqar • ${config.prefix}zahid
│ ${config.prefix}syed • ${config.prefix}devil
└─────────────────────────────────

┌─────────────────────────────────
│  ⬇️ *DOWNLOADER COMMANDS*
├─────────────────────────────────
│ ${config.prefix}play • ${config.prefix}playvid
│ ${config.prefix}tiktok • ${config.prefix}tt
│ ${config.prefix}instagram • ${config.prefix}ig
│ ${config.prefix}facebook • ${config.prefix}fb
│ ${config.prefix}youtube • ${config.prefix}yt
│ ${config.prefix}movie • ${config.prefix}song
│ ${config.prefix}twitter • ${config.prefix}pinterest
│ ${config.prefix}apk • ${config.prefix}mediafire
└─────────────────────────────────

┌─────────────────────────────────
│  🔍 *SEARCH COMMANDS*
├─────────────────────────────────
│ ${config.prefix}google • ${config.prefix}wiki
│ ${config.prefix}image • ${config.prefix}giphy
│ ${config.prefix}lyrics • ${config.prefix}npm
│ ${config.prefix}github • ${config.prefix}pypi
│ ${config.prefix}imdb • ${config.prefix}anime
│ ${config.prefix}manga • ${config.prefix}wallpaper
│ ${config.prefix}definition • ${config.prefix}spell
│ ${config.prefix}urban • ${config.prefix}recipe
│ ${config.prefix}news • ${config.prefix}crypto
│ ${config.prefix}stock • ${config.prefix}emoji
└─────────────────────────────────

┌─────────────────────────────────
│  🔄 *CONVERTER COMMANDS*
├─────────────────────────────────
│ ${config.prefix}sticker • ${config.prefix}toimage
│ ${config.prefix}tts • ${config.prefix}tomp3
│ ${config.prefix}trim • ${config.prefix}compress
│ ${config.prefix}resize • ${config.prefix}rotate
│ ${config.prefix}blur • ${config.prefix}grayscale
│ ${config.prefix}invert • ${config.prefix}sharpen
│ ${config.prefix}crop • ${config.prefix}flip
│ ${config.prefix}pdf2img • ${config.prefix}img2pdf
│ ${config.prefix}webp2mp4 • ${config.prefix}gif2sticker
│ ${config.prefix}removebg
└─────────────────────────────────

┌─────────────────────────────────
│  🎭 *STICKER COMMANDS*
├─────────────────────────────────
│ ${config.prefix}sticker • ${config.prefix}stickerinfo
│ ${config.prefix}steal • ${config.prefix}addsticker
│ ${config.prefix}emojimix • ${config.prefix}stickerpack
│ ${config.prefix}aisticker • ${config.prefix}text2sticker
└─────────────────────────────────

┌─────────────────────────────────
│  📡 *CHANNEL*
├─────────────────────────────────
│ ${config.channelLink}
└─────────────────────────────────

> _Powered by ${config.botName}_
`.trim();

      await sock.sendMessage(jid, { text: menuText }, { quoted: msg });
    },
  },
  {
    name: 'ping',
    alias: ['speed'],
    description: 'Check bot response speed',
    category: 'Utility',
    async execute({ sock, msg, jid }) {
      const start = Date.now();
      const sent = await sock.sendMessage(jid, { text: '🏓 Pinging...' }, { quoted: msg });
      const end = Date.now();
      await sock.sendMessage(jid, {
        text: `🏓 *Pong!*\n\n⚡ Speed: *${end - start}ms*\n🤖 Bot: *${config.botName}*`,
        edit: sent.key,
      });
    },
  },
  {
    name: 'uptime',
    description: 'Check bot uptime',
    async execute({ sock, msg, jid }) {
      const up = runtime(process.uptime());
      await sock.sendMessage(jid, {
        text: `⏱️ *Bot Uptime*\n\n🕐 Running for: *${up}*\n🤖 Bot: *${config.botName}*`,
      }, { quoted: msg });
    },
  },
  {
    name: 'info',
    description: 'Show bot information',
    async execute({ sock, msg, jid }) {
      const text = `╔══════════════════════╗
║   🤖 *BOT INFORMATION*   ║
╚══════════════════════╝

🏷️ *Name:* ${config.botName}
👑 *Owner:* ${config.ownerName}
🔧 *Version:* v${config.version}
⚙️ *Prefix:* ${config.prefix}
📡 *Mode:* ${config.mode}
⏱️ *Uptime:* ${runtime(process.uptime())}
🖥️ *Platform:* ${process.platform}
💾 *Memory:* ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB
⚡ *Node.js:* ${process.version}

📡 *Channel:* ${config.channelLink}`;
      await sock.sendMessage(jid, { text }, { quoted: msg });
    },
  },
];
