const axios = require('axios');
const ytSearch = require('yt-search');
const { fetchBuffer, sanitizeFilename, sleep } = require('../lib/functions');
const config = require('../config');
const fs = require('fs');
const path = require('path');

async function ytDownload(url, format = 'audio') {
  const apiUrl = `https://api.vevioz.com/api/button/${format === 'audio' ? 'mp3' : 'mp4'}/${encodeURIComponent(url)}`;
  const { data } = await axios.get(apiUrl, { timeout: 30000 });
  return data;
}

async function searchYT(query) {
  const results = await ytSearch(query);
  return results.videos[0];
}

module.exports = [
  {
    name: 'play',
    alias: ['song', 'music'],
    description: 'Download and play a song',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .play <song name or YouTube URL>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: `🎵 *Searching for:* ${body}...` }, { quoted: msg });
      try {
        const video = await searchYT(body);
        if (!video) return sock.sendMessage(jid, { text: '❌ No results found.' }, { quoted: msg });
        const info = `🎵 *${video.title}*\n\n👤 Channel: ${video.author.name}\n⏱️ Duration: ${video.timestamp}\n👀 Views: ${video.views.toLocaleString()}\n🔗 ${video.url}`;
        await sock.sendMessage(jid, { text: info + '\n\n⏳ Downloading...' }, { quoted: msg });
        const audioUrl = `https://api.downloads.vip/api/download/youtube/mp3?url=${encodeURIComponent(video.url)}&apikey=free`;
        const { data } = await axios.get(audioUrl, { timeout: 60000 });
        if (data?.url) {
          const buffer = await fetchBuffer(data.url);
          await sock.sendMessage(jid, {
            audio: buffer,
            mimetype: 'audio/mp4',
            ptt: false,
            fileName: sanitizeFilename(video.title) + '.mp3',
          }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { text: `✅ *${video.title}*\n\n🔗 ${video.url}\n\n_Direct download: Use a YouTube MP3 converter with this link_` }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Download failed: ${e.message}\n\nTry using .youtube for video.` }, { quoted: msg });
      }
    },
  },
  {
    name: 'playvid',
    alias: ['youtube', 'yt'],
    description: 'Download a YouTube video',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .youtube <title or URL>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: `📺 *Searching YouTube:* ${body}...` }, { quoted: msg });
      try {
        const video = await searchYT(body);
        if (!video) return sock.sendMessage(jid, { text: '❌ No results found.' }, { quoted: msg });
        if (video.seconds > 600) return sock.sendMessage(jid, { text: '❌ Video too long (max 10 minutes).' }, { quoted: msg });
        const info = `📺 *${video.title}*\n\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n👀 ${video.views.toLocaleString()} views`;
        await sock.sendMessage(jid, { text: info + '\n\n⏳ Downloading...' }, { quoted: msg });
        const dlUrl = `https://api.downloads.vip/api/download/youtube/mp4?url=${encodeURIComponent(video.url)}&apikey=free`;
        const { data } = await axios.get(dlUrl, { timeout: 60000 });
        if (data?.url) {
          const buffer = await fetchBuffer(data.url);
          await sock.sendMessage(jid, { video: buffer, caption: `📺 *${video.title}*\n\n_Downloaded by ${config.botName}_` }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { text: `🔗 *${video.title}*\n\n${video.url}\n\n_Could not auto-download — copy the link above._` }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'tiktok',
    alias: ['tt'],
    description: 'Download TikTok video without watermark',
    async execute({ sock, msg, jid, body }) {
      if (!body || !body.includes('tiktok')) return sock.sendMessage(jid, { text: '❌ Usage: .tiktok <TikTok URL>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Downloading TikTok...' }, { quoted: msg });
      try {
        const apis = [
          `https://api.tiklydown.eu.org/api/download/v2?url=${encodeURIComponent(body)}`,
          `https://api.douyin.wtf/api?url=${encodeURIComponent(body)}&minimal=true`,
        ];
        let videoUrl = null;
        for (const api of apis) {
          try {
            const { data } = await axios.get(api, { timeout: 15000 });
            videoUrl = data?.video?.noWatermark || data?.video?.play || data?.nwm_video_url_HQ || data?.nwm_video_url;
            if (videoUrl) break;
          } catch {}
        }
        if (!videoUrl) return sock.sendMessage(jid, { text: '❌ Could not download TikTok. Try another URL.' }, { quoted: msg });
        const buffer = await fetchBuffer(videoUrl);
        await sock.sendMessage(jid, { video: buffer, caption: `✅ *TikTok Downloaded!*\n\n🚫 No Watermark\n_— ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ TikTok download failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'instagram',
    alias: ['ig', 'insta'],
    description: 'Download Instagram photo/video/reel',
    async execute({ sock, msg, jid, body }) {
      if (!body || !body.includes('instagram')) return sock.sendMessage(jid, { text: '❌ Usage: .instagram <Instagram URL>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Downloading Instagram...' }, { quoted: msg });
      try {
        const { data } = await axios.post('https://saveig.app/api/ajaxSearch', `recaptchaToken=&q=${encodeURIComponent(body)}&lang=en&version=v2`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-requested-with': 'XMLHttpRequest' },
          timeout: 20000,
        });
        const html = data.data || '';
        const urlMatch = html.match(/href="(https?:\/\/[^"]+\.mp4[^"]*)/);
        const imgMatch = html.match(/src="(https?:\/\/[^"]+\.jpg[^"]*)/);
        const mediaUrl = urlMatch?.[1] || imgMatch?.[1];
        if (!mediaUrl) return sock.sendMessage(jid, { text: '❌ Could not extract media. Try a public post.' }, { quoted: msg });
        const buffer = await fetchBuffer(mediaUrl);
        if (urlMatch) {
          await sock.sendMessage(jid, { video: buffer, caption: `✅ *Instagram Video*\n\n_Downloaded by ${config.botName}_` }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { image: buffer, caption: `✅ *Instagram Image*\n\n_Downloaded by ${config.botName}_` }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Instagram download failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'facebook',
    alias: ['fb'],
    description: 'Download Facebook video',
    async execute({ sock, msg, jid, body }) {
      if (!body || !body.includes('facebook')) return sock.sendMessage(jid, { text: '❌ Usage: .facebook <Facebook Video URL>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Downloading Facebook video...' }, { quoted: msg });
      try {
        const { data } = await axios.post('https://getfvid.com/downloader', `url=${encodeURIComponent(body)}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 20000,
        });
        const hdMatch = data.match(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/);
        const videoUrl = hdMatch?.[1];
        if (!videoUrl) return sock.sendMessage(jid, { text: '❌ Could not extract video. Make sure the post is public.' }, { quoted: msg });
        const buffer = await fetchBuffer(videoUrl);
        await sock.sendMessage(jid, { video: buffer, caption: `✅ *Facebook Video*\n\n_Downloaded by ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Facebook download failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'movie',
    alias: ['film'],
    description: 'Search and get HD movie download links',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .movie <movie name>\n\nExample: .movie Avengers Endgame' }, { quoted: msg });
      await sock.sendMessage(jid, { text: `🎬 *Searching for:* ${body}...` }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(body)}&limit=3&sort_by=rating`, { timeout: 15000 });
        const movies = data.data?.movies;
        if (!movies?.length) return sock.sendMessage(jid, { text: `❌ No movies found for "${body}". Try a different title.` }, { quoted: msg });
        const movie = movies[0];
        const torrents = movie.torrents || [];
        const hdTorrent = torrents.find(t => t.quality === '1080p') || torrents.find(t => t.quality === '720p') || torrents[0];
        const qualityList = torrents.map(t => `• ${t.quality} — ${t.size} (${t.type})`).join('\n');
        const text = `🎬 *${movie.title} (${movie.year})*\n\n⭐ IMDb: ${movie.rating}/10\n🎭 Genre: ${movie.genres?.join(', ')}\n⏱️ Runtime: ${movie.runtime} min\n🌍 Language: ${movie.language?.toUpperCase()}\n\n📝 *Synopsis:*\n${movie.synopsis?.substring(0, 300) || 'No synopsis available.'}...\n\n💿 *Available Quality:*\n${qualityList}\n\n🏆 *Best Quality:* ${hdTorrent?.quality || 'N/A'} — ${hdTorrent?.size || 'N/A'}\n🔗 *Magnet/Torrent:* ${movie.url || 'See YTS.mx'}\n\n🌐 *Full Details:* ${movie.url}`;
        if (movie.large_cover_image) {
          await sock.sendMessage(jid, { image: { url: movie.large_cover_image }, caption: text }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { text }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Movie search failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'twitter',
    alias: ['twit'],
    description: 'Download Twitter/X media',
    async execute({ sock, msg, jid, body }) {
      if (!body || (!body.includes('twitter') && !body.includes('x.com'))) return sock.sendMessage(jid, { text: '❌ Usage: .twitter <Twitter/X URL>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Downloading Twitter media...' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(body)}`, { timeout: 15000 });
        const htmlParse = require('node-html-parser').parse(data);
        const links = htmlParse.querySelectorAll('a').map(a => a.getAttribute('href')).filter(h => h && h.includes('.mp4'));
        if (!links.length) return sock.sendMessage(jid, { text: '❌ No downloadable media found in this tweet.' }, { quoted: msg });
        const buffer = await fetchBuffer(links[0]);
        await sock.sendMessage(jid, { video: buffer, caption: `✅ *Twitter Video Downloaded!*\n\n_— ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Twitter download failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'pinterest',
    alias: ['pin'],
    description: 'Search and download Pinterest images',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .pinterest <search term>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.pinterestapi.co.uk/search/pins/?q=${encodeURIComponent(body)}`, { timeout: 10000 });
        const images = data?.body?.slice(0, 5) || [];
        if (!images.length) return sock.sendMessage(jid, { text: '❌ No results found.' }, { quoted: msg });
        for (const img of images.slice(0, 3)) {
          const imgUrl = img?.images?.orig?.url || img?.image_medium_url;
          if (imgUrl) {
            const buffer = await fetchBuffer(imgUrl);
            await sock.sendMessage(jid, { image: buffer, caption: `📌 *Pinterest Image*\n\n🔍 Search: ${body}` }, { quoted: msg });
            await sleep(500);
          }
        }
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Pinterest search failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'apk',
    description: 'Search for APK download',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .apk <app name>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: `📱 *Searching APK:* ${body}...` }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://apkpure.com/search?q=${encodeURIComponent(body)}`, { timeout: 15000 });
        const parse = require('node-html-parser').parse(data);
        const app = parse.querySelector('.search-dl');
        const name = app?.querySelector('p.apk-name')?.text || body;
        const link = 'https://apkpure.com' + (app?.querySelector('a')?.getAttribute('href') || '');
        const icon = app?.querySelector('img')?.getAttribute('src');
        const replyText = `📱 *APK Found!*\n\n📌 App: ${name}\n🔗 Link: ${link}\n\n_Tap the link to download from APKPure_`;
        if (icon) {
          await sock.sendMessage(jid, { image: { url: icon }, caption: replyText }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { text: replyText }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ APK search failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'mediafire',
    alias: ['mf'],
    description: 'Get direct MediaFire download link',
    async execute({ sock, msg, jid, body }) {
      if (!body || !body.includes('mediafire')) return sock.sendMessage(jid, { text: '❌ Usage: .mediafire <MediaFire URL>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ Processing MediaFire link...' }, { quoted: msg });
      try {
        const { data } = await axios.get(body, { timeout: 15000 });
        const parse = require('node-html-parser').parse(data);
        const directLink = parse.querySelector('#downloadButton')?.getAttribute('href');
        const fileName = parse.querySelector('.filename')?.text?.trim();
        const fileSize = parse.querySelector('.subheading')?.text?.trim();
        if (!directLink) return sock.sendMessage(jid, { text: '❌ Could not extract download link.' }, { quoted: msg });
        await sock.sendMessage(jid, { text: `✅ *MediaFire Direct Link!*\n\n📄 File: ${fileName || 'Unknown'}\n📦 Size: ${fileSize || 'Unknown'}\n🔗 Download: ${directLink}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ MediaFire failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
];
