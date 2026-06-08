require('dotenv').config();

const config = {
  // ═══════════════════════════════════════════
  //         MARCO MALIK MD - Configuration
  // ═══════════════════════════════════════════

  // Owner Settings
  ownerNumber: process.env.OWNER_NUMBER || '923001234567',
  ownerName: process.env.OWNER_NAME || 'Marco Malik',
  botName: process.env.BOT_NAME || 'MARCO MALIK MD',
  prefix: process.env.PREFIX || '.',

  // Bot Mode: public / private
  mode: process.env.BOT_MODE || 'public',

  // WhatsApp Channel
  channelLink: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VaxyzABCDEFGHIJKL',

  // Pairing Website
  pairWebsite: process.env.PAIR_WEBSITE || 'https://pair.marco-malik.com',

  // AI Keys
  openaiKey: process.env.OPENAI_API_KEY || '',
  geminiKey: process.env.GEMINI_API_KEY || '',

  // Database
  mongoUri: process.env.MONGO_URI || '',

  // AntiDelete
  antiDelete: process.env.ANTI_DELETE === 'true',

  // Anti Spam
  antiSpam: true,
  spamLimit: 5,
  spamInterval: 10000,

  // Anti Call
  antiCall: true,

  // Anti Link
  antiLink: false,

  // Auto Features
  autoRead: process.env.AUTO_READ === 'true',
  autoReact: process.env.AUTO_REACT !== 'false',
  reactMode: process.env.REACT_MODE || 'random', // 'random' or 'fixed'
  fixedReact: '💚',
  autoStatusView: process.env.AUTO_STATUS_VIEW !== 'false',
  autoStatusReply: process.env.AUTO_STATUS_REPLY !== 'false',
  statusReplyMessage: process.env.STATUS_REPLY_MESSAGE || 'Seen Your Status 👀 By Marco Malik',

  // Welcome/Goodbye
  welcome: true,
  goodbye: true,

  // View Once Reader
  viewOnce: true,

  // Port
  port: parseInt(process.env.PORT) || 3000,

  // Session
  sessionId: process.env.SESSION_ID || '',

  // Remove.bg API
  removebgKey: process.env.REMOVEBG_API_KEY || '',

  // Random Emoji Reactions
  reactions: ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '🎉', '💯', '✅', '🫡', '👏', '🤩', '😍', '⚡'],

  // Image Generator Commands mapping
  imageCommands: {
    marco: 'Marco Malik AI Art',
    waqar: 'Waqar AI Art',
    zahid: 'Zahid AI Art',
    syed: 'Syed AI Art',
    devil: 'Devil Dark AI Art',
  },

  // Session Directory
  sessionDir: './session',

  // Temp Directory
  tempDir: './temp',

  // Version
  version: '2.0.0',
};

module.exports = config;
