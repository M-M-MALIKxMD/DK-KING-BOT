<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=30&duration=3000&pause=1000&color=00FF41&center=true&vCenter=true&width=600&lines=MARCO+MALIK+MD;WhatsApp+Bot+v2.0.0;300%2B+Commands;AI+Powered+Bot" alt="Typing Animation" />

<br/>

![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen?style=for-the-badge&logo=github)
![Node](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Commands](https://img.shields.io/badge/Commands-300%2B-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-WhatsApp-25D366?style=for-the-badge&logo=whatsapp)

<br/>

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/marcomalik/marco-malik-md?style=social)](https://github.com/marcomalik/marco-malik-md)
[![GitHub Forks](https://img.shields.io/github/forks/marcomalik/marco-malik-md?style=social)](https://github.com/marcomalik/marco-malik-md)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Commands](#-commands)
- [Installation](#-installation)
- [Deploy Guide](#-deploy-guide)
- [Environment Variables](#-environment-variables)
- [Configuration](#-configuration)
- [Contact](#-contact)

---

## ✨ Features

<div align="center">

| Feature | Status |
|---------|--------|
| 300+ Commands | ✅ |
| AI Chatbot (Gemini + GPT) | ✅ |
| AI Image Generator | ✅ |
| Auto React (Random & Fixed) | ✅ |
| Auto Read | ✅ |
| Auto Status View & Reply | ✅ |
| View Once Reader | ✅ |
| Anti Delete | ✅ |
| Anti Link | ✅ |
| Anti Spam | ✅ |
| Anti Call | ✅ |
| Welcome & Goodbye System | ✅ |
| Movie Downloader (HD) | ✅ |
| TikTok Downloader | ✅ |
| Instagram Downloader | ✅ |
| YouTube Downloader | ✅ |
| Sticker Maker | ✅ |
| QR Generator | ✅ |
| Website Screenshot | ✅ |
| Railway/Render/Heroku Ready | ✅ |

</div>

---

## 🤖 Commands

### 👑 Owner Commands
```
.broadcast  .ban  .unban  .setprefix  .setmode  .restart
.shutdown  .join  .leave  .block  .unblock  .eval
.clearchat  .listgroups  .sendmsg  .autoreact  .autoread
```

### 🛡️ Admin Commands
```
.kick  .add  .promote  .demote  .mute  .unmute
.warn  .resetwarn  .warnlist  .antilink  .antispam
.antidelete  .welcome  .goodbye  .tagall  .hidetag
.setdesc  .setname  .linkgroup  .revoke  .setppgc
```

### 👥 Group Commands
```
.groupinfo  .members  .admins  .poll
.setwelcome  .setgoodbye  .invite
```

### 🎮 Fun Commands
```
.joke  .fact  .quote  .dare  .truth  .roast
.ship  .love  .rate  .roll  .flip  .8ball
.rizz  .pickup  .wyr  .nhie  .compliment
.insult  .horoscope  .meme  .guess
```

### 🔧 Utility Commands
```
.ping  .uptime  .info  .calc  .weather  .time
.translate  .base64  .qr  .ss  .img2url
.shorturl  .currency  .password  .hash
.binary  .morse  .ascii  .encode  .decode
.lorem  .uuid  .urlencode  .urldecode
.countwords  .reverse  .ip  .color  .crypto  .whois
```

### 🤖 AI Commands
```
.ai  .gpt  .gemini  .chatgpt  .imagine  .dalle
.aisticker  .marco  .waqar  .zahid  .syed  .devil
```

### ⬇️ Downloader Commands
```
.play  .playvid  .youtube  .tiktok  .instagram
.facebook  .movie  .twitter  .pinterest  .apk  .mediafire
```

### 🔍 Search Commands
```
.google  .wiki  .image  .giphy  .lyrics  .npm
.github  .imdb  .anime  .manga  .wallpaper
.definition  .urban  .recipe  .news  .spell  .emoji
```

### 🔄 Converter Commands
```
.sticker  .toimage  .tts  .tomp3  .resize
.blur  .grayscale  .invert  .sharpen  .rotate
.removebg  .compress  .webp2mp4  .gif2sticker
```

### 🎭 Sticker Commands
```
.steal  .stickerinfo  .addsticker  .emojimix
.text2sticker  .stickerpack
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- A WhatsApp account

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/marcomalik/marco-malik-md.git
cd marco-malik-md

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Edit configuration
nano .env

# 5. Start the bot
npm start
```

Scan the QR code that appears in your terminal with WhatsApp.

---

## 🚀 Deploy Guide

### 🚂 Railway (Recommended)

1. Fork this repository on GitHub
2. Go to [railway.app](https://railway.app) and login
3. Click **New Project → Deploy from GitHub Repo**
4. Select your forked repository
5. Add environment variables (see below)
6. Deploy!

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

---

### 🎨 Render

1. Fork this repository on GitHub
2. Go to [render.com](https://render.com) and login
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
6. Add environment variables
7. Deploy!

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

### 🟣 Heroku

1. Fork this repository on GitHub
2. Go to [heroku.com](https://heroku.com) and login
3. Create a new app
4. Connect your GitHub repo
5. Enable automatic deploys
6. Add Config Vars (environment variables)
7. Deploy!

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OWNER_NUMBER` | ✅ | Your WhatsApp number (with country code, no +) |
| `OWNER_NAME` | ✅ | Your name |
| `BOT_NAME` | ❌ | Bot display name (default: MARCO MALIK MD) |
| `PREFIX` | ❌ | Command prefix (default: .) |
| `SESSION_ID` | ✅ | Session ID from pairing website |
| `GEMINI_API_KEY` | ❌ | Google Gemini API key for AI features |
| `OPENAI_API_KEY` | ❌ | OpenAI API key for GPT features |
| `REMOVEBG_API_KEY` | ❌ | Remove.bg API key for background removal |
| `CHANNEL_LINK` | ❌ | Your WhatsApp channel link |
| `AUTO_REACT` | ❌ | Enable auto react (true/false) |
| `REACT_MODE` | ❌ | React mode: random or fixed |
| `AUTO_READ` | ❌ | Auto read messages (true/false) |
| `AUTO_STATUS_VIEW` | ❌ | Auto view statuses (true/false) |
| `AUTO_STATUS_REPLY` | ❌ | Auto reply to statuses (true/false) |
| `STATUS_REPLY_MESSAGE` | ❌ | Custom status reply text |
| `ANTI_DELETE` | ❌ | Anti-delete messages (true/false) |
| `BOT_MODE` | ❌ | public or private |
| `PORT` | ❌ | Server port (auto-set by platforms) |

---

## ⚙️ Configuration

Edit `config.js` to customize:

```js
const config = {
  ownerNumber: '923001234567',  // Your number
  ownerName: 'Marco Malik',     // Your name
  botName: 'MARCO MALIK MD',    // Bot name
  prefix: '.',                  // Command prefix
  mode: 'public',               // public / private
  autoReact: true,              // Auto react toggle
  reactMode: 'random',          // random / fixed
  autoStatusView: true,         // View statuses
  autoStatusReply: true,        // Reply to statuses
  antiCall: true,               // Reject calls
  viewOnce: true,               // View once reader
};
```

---

## 📱 Getting Session ID

Use the pairing website to get your Session ID without scanning a QR:

1. Visit the pairing website
2. Enter your WhatsApp number
3. Enter the pairing code shown in WhatsApp
4. Copy the `SESSION_ID` and add it to your `.env`

---

## 📞 Contact & Support

<div align="center">

[![WhatsApp](https://img.shields.io/badge/WhatsApp-Contact-25D366?style=for-the-badge&logo=whatsapp)](https://wa.me/923001234567)
[![Telegram](https://img.shields.io/badge/Telegram-Join-2CA5E0?style=for-the-badge&logo=telegram)](https://t.me/marcomalik)
[![YouTube](https://img.shields.io/badge/YouTube-Subscribe-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com)

</div>

---

## 📄 License

```
MIT License

Copyright (c) 2024 Marco Malik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

<div align="center">

**Made with ❤️ by Marco Malik**

⭐ Star this repo if you found it useful!

</div>
