const axios = require('axios');
const { fetchBuffer } = require('../lib/functions');
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = [
  {
    name: 'sticker',
    alias: ['s', 'stick'],
    description: 'Convert image/video to sticker',
    async execute({ sock, msg, jid, quoted, args }) {
      const q = quoted?.message || msg.message;
      const hasImage = q?.imageMessage || q?.videoMessage || q?.documentMessage;
      if (!hasImage) return sock.sendMessage(jid, { text: '❌ Reply to an image or video.\n\nUsage: .sticker (reply to image/video)' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Creating sticker...' }, { quoted: msg });
      try {
        const { default: Sticker, StickerTypes } = require('wa-sticker-formatter');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const packName = args[0] || config.botName;
        const authorName = args[1] || config.ownerName;
        const sticker = new Sticker(buffer, {
          pack: packName,
          author: authorName,
          type: StickerTypes.FULL,
          quality: 50,
        });
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Sticker creation failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'toimage',
    alias: ['toimg', 'stickertoimage'],
    description: 'Convert sticker to image',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.stickerMessage) return sock.sendMessage(jid, { text: '❌ Reply to a sticker.\n\nUsage: .toimage (reply to sticker)' }, { quoted: msg });
      try {
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const sharp = require('sharp');
        const imageBuffer = await sharp(buffer).png().toBuffer();
        await sock.sendMessage(jid, { image: imageBuffer, caption: '✅ *Sticker converted to image!*' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Conversion failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'tts',
    alias: ['speak', 'voice'],
    description: 'Convert text to speech',
    async execute({ sock, msg, jid, args, body }) {
      const lang = args[0]?.length === 2 ? args[0] : 'en';
      const text = args[0]?.length === 2 ? args.slice(1).join(' ') : body;
      if (!text) return sock.sendMessage(jid, { text: '❌ Usage: .tts <text>\n.tts ur <urdu text>' }, { quoted: msg });
      try {
        const gTTS = require('google-tts-api');
        const url = gTTS.getAudioUrl(text, { lang, slow: false });
        const buffer = await fetchBuffer(url);
        await sock.sendMessage(jid, {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: true,
        }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ TTS failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'tomp3',
    alias: ['mp3', 'extractaudio'],
    description: 'Extract audio from a video',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.videoMessage && !q?.audioMessage) return sock.sendMessage(jid, { text: '❌ Reply to a video/audio.\n\nUsage: .tomp3 (reply to video)' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Extracting audio...' }, { quoted: msg });
      try {
        const { execPromise, ensureDir } = require('../lib/functions');
        ensureDir('./temp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const inputPath = `./temp/input_${Date.now()}.mp4`;
        const outputPath = `./temp/output_${Date.now()}.mp3`;
        fs.writeFileSync(inputPath, buffer);
        await execPromise(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 192k ${outputPath}`);
        const audioBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(jid, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: false }, { quoted: msg });
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Audio extraction failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'resize',
    description: 'Resize an image',
    async execute({ sock, msg, jid, quoted, args }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.\n\nUsage: .resize 500x500 (reply to image)' }, { quoted: msg });
      const [w, h] = (args[0] || '512x512').split('x').map(Number);
      try {
        const sharp = require('sharp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const resized = await sharp(buffer).resize(w || 512, h || 512).jpeg().toBuffer();
        await sock.sendMessage(jid, { image: resized, caption: `✅ *Resized to ${w}x${h}px*` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Resize failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'blur',
    description: 'Blur an image',
    async execute({ sock, msg, jid, quoted, args }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      const sigma = parseFloat(args[0]) || 5;
      try {
        const sharp = require('sharp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const blurred = await sharp(buffer).blur(sigma).jpeg().toBuffer();
        await sock.sendMessage(jid, { image: blurred, caption: `✅ *Blurred (sigma: ${sigma})*` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Blur failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'grayscale',
    alias: ['greyscale', 'bw'],
    description: 'Convert image to grayscale',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      try {
        const sharp = require('sharp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const bw = await sharp(buffer).grayscale().jpeg().toBuffer();
        await sock.sendMessage(jid, { image: bw, caption: '✅ *Converted to grayscale!*' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Grayscale failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'invert',
    description: 'Invert image colors',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      try {
        const sharp = require('sharp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const inverted = await sharp(buffer).negate().jpeg().toBuffer();
        await sock.sendMessage(jid, { image: inverted, caption: '✅ *Colors inverted!*' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Invert failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'sharpen',
    description: 'Sharpen an image',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      try {
        const sharp = require('sharp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const sharpened = await sharp(buffer).sharpen().jpeg().toBuffer();
        await sock.sendMessage(jid, { image: sharpened, caption: '✅ *Image sharpened!*' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Sharpen failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'rotate',
    description: 'Rotate an image',
    async execute({ sock, msg, jid, quoted, args }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.\n\nUsage: .rotate 90 (reply to image)' }, { quoted: msg });
      const degrees = parseInt(args[0]) || 90;
      try {
        const sharp = require('sharp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const rotated = await sharp(buffer).rotate(degrees).jpeg().toBuffer();
        await sock.sendMessage(jid, { image: rotated, caption: `✅ *Rotated ${degrees}°*` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Rotate failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'removebg',
    alias: ['rmbg'],
    description: 'Remove background from image',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      if (!config.removebgKey) return sock.sendMessage(jid, { text: '❌ Remove.bg API key not configured.\n\nSet REMOVEBG_API_KEY in .env file.' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Removing background...' }, { quoted: msg });
      try {
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const FormData = require('form-data');
        const form = new FormData();
        form.append('image_file', buffer, { filename: 'image.jpg' });
        form.append('size', 'auto');
        const { data } = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
          headers: { ...form.getHeaders(), 'X-Api-Key': config.removebgKey },
          responseType: 'arraybuffer',
          timeout: 30000,
        });
        await sock.sendMessage(jid, { image: Buffer.from(data), caption: '✅ *Background removed!*' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Remove.bg failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'compress',
    description: 'Compress an image',
    async execute({ sock, msg, jid, quoted, args }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      const quality = Math.min(parseInt(args[0]) || 50, 100);
      try {
        const sharp = require('sharp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const compressed = await sharp(buffer).jpeg({ quality }).toBuffer();
        const orig = buffer.length;
        const comp = compressed.length;
        const saved = (((orig - comp) / orig) * 100).toFixed(1);
        await sock.sendMessage(jid, {
          image: compressed,
          caption: `✅ *Image compressed!*\n\n📦 Original: ${(orig / 1024).toFixed(1)}KB\n📦 Compressed: ${(comp / 1024).toFixed(1)}KB\n💾 Saved: ${saved}%`,
        }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Compress failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'webp2mp4',
    alias: ['webptovid'],
    description: 'Convert animated WebP sticker to video',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.stickerMessage) return sock.sendMessage(jid, { text: '❌ Reply to an animated sticker.' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Converting sticker to video...' }, { quoted: msg });
      try {
        const { execPromise, ensureDir } = require('../lib/functions');
        ensureDir('./temp');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const inputPath = `./temp/sticker_${Date.now()}.webp`;
        const outputPath = `./temp/output_${Date.now()}.mp4`;
        fs.writeFileSync(inputPath, buffer);
        await execPromise(`ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`);
        const videoBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(jid, { video: videoBuffer, caption: '✅ *Sticker converted to video!*' }, { quoted: msg });
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Conversion failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'gif2sticker',
    alias: ['gifsticker'],
    description: 'Convert GIF to animated sticker',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.videoMessage && !q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to a GIF/video.\n\nUsage: .gif2sticker (reply to GIF)' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Converting to animated sticker...' }, { quoted: msg });
      try {
        const { default: Sticker, StickerTypes } = require('wa-sticker-formatter');
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        const sticker = new Sticker(buffer, {
          pack: config.botName,
          author: config.ownerName,
          type: StickerTypes.FULL,
          quality: 50,
        });
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ GIF sticker failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
];
