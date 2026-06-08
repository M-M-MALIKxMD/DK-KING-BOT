const axios = require('axios');
const ytSearch = require('yt-search');
const { fetchBuffer } = require('../lib/functions');
const config = require('../config');

module.exports = [
  {
    name: 'google',
    alias: ['search'],
    description: 'Search Google',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .google <query>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://ddg-webapp-aagd.vercel.app/search?q=${encodeURIComponent(body)}&region=wt-wt&safesearch=moderate&time=&language=en&num=5`, { timeout: 10000 });
        const results = data.results?.slice(0, 5);
        if (!results?.length) return sock.sendMessage(jid, { text: '❌ No results found.' }, { quoted: msg });
        const text = `🔍 *Google Search: "${body}"*\n\n` + results.map((r, i) => `*${i + 1}.* ${r.title}\n📝 ${r.body?.substring(0, 100) || ''}...\n🔗 ${r.href}`).join('\n\n');
        await sock.sendMessage(jid, { text }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `🔍 *Search Results for: ${body}*\n\n🔗 https://www.google.com/search?q=${encodeURIComponent(body)}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'wiki',
    alias: ['wikipedia'],
    description: 'Search Wikipedia',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .wiki <topic>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(body)}`, { timeout: 10000 });
        const text = `📚 *Wikipedia: ${data.title}*\n\n${data.extract?.substring(0, 800) || 'No description.'}...\n\n🔗 ${data.content_urls?.desktop?.page || ''}`;
        if (data.thumbnail?.source) {
          await sock.sendMessage(jid, { image: { url: data.thumbnail.source }, caption: text }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { text }, { quoted: msg });
        }
      } catch {
        await sock.sendMessage(jid, { text: `❌ Wikipedia article not found for "${body}".` }, { quoted: msg });
      }
    },
  },
  {
    name: 'image',
    alias: ['img', 'pic'],
    description: 'Search for an image',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .image <search term>' }, { quoted: msg });
      try {
        const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(body)}&client_id=YOUR_UNSPLASH_KEY`;
        const fallbackUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(body)}`;
        const buffer = await fetchBuffer(fallbackUrl);
        await sock.sendMessage(jid, { image: buffer, caption: `🖼️ *Image: ${body}*\n\n_Found via Unsplash_` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ Could not find image for "${body}".` }, { quoted: msg });
      }
    },
  },
  {
    name: 'giphy',
    alias: ['gif'],
    description: 'Search for a GIF',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .giphy <search term>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(body)}&limit=1&rating=g`, { timeout: 10000 });
        const gif = data.data?.[0];
        if (!gif) return sock.sendMessage(jid, { text: '❌ No GIFs found.' }, { quoted: msg });
        const buffer = await fetchBuffer(gif.images.original.url);
        await sock.sendMessage(jid, { video: buffer, gifPlayback: true, caption: `🎬 *GIF: ${body}*` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ GIF search failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'lyrics',
    alias: ['lyric'],
    description: 'Search song lyrics',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .lyrics <song name>\n\nExample: .lyrics Despacito' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(body).replace('%20', '/')}`, { timeout: 15000 });
        const lyrics = data.lyrics;
        if (!lyrics) return sock.sendMessage(jid, { text: '❌ Lyrics not found.' }, { quoted: msg });
        const chunks = lyrics.match(/.{1,3000}/gs) || [lyrics];
        await sock.sendMessage(jid, { text: `🎵 *Lyrics: ${body}*\n\n${chunks[0]}${chunks.length > 1 ? '\n\n_... (lyrics truncated)_' : ''}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ Could not find lyrics for "${body}".` }, { quoted: msg });
      }
    },
  },
  {
    name: 'npm',
    description: 'Search npm packages',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .npm <package name>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://registry.npmjs.org/${body}`, { timeout: 10000 });
        const latest = data['dist-tags']?.latest;
        const v = data.versions?.[latest];
        await sock.sendMessage(jid, { text: `📦 *npm: ${data.name}@${latest}*\n\n📝 ${data.description || 'No description'}\n👤 Author: ${typeof data.author === 'object' ? data.author?.name : data.author || 'Unknown'}\n📅 Updated: ${new Date(data.time?.modified).toLocaleDateString()}\n⭐ License: ${v?.license || 'N/A'}\n\n🔗 https://npmjs.com/package/${data.name}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ Package "${body}" not found on npm.` }, { quoted: msg });
      }
    },
  },
  {
    name: 'github',
    alias: ['gh'],
    description: 'Search GitHub repositories',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .github <repo or user>\n\nExample: .github whiskeysockets/baileys' }, { quoted: msg });
      try {
        const endpoint = body.includes('/') ? `repos/${body}` : `users/${body}`;
        const { data } = await axios.get(`https://api.github.com/${endpoint}`, {
          headers: { 'User-Agent': 'MARCO-MALIK-MD-Bot' },
          timeout: 10000,
        });
        if (body.includes('/')) {
          await sock.sendMessage(jid, { text: `📦 *GitHub: ${data.full_name}*\n\n📝 ${data.description || 'No description'}\n⭐ Stars: ${data.stargazers_count.toLocaleString()}\n🍴 Forks: ${data.forks_count.toLocaleString()}\n👁️ Watchers: ${data.watchers_count.toLocaleString()}\n📅 Updated: ${new Date(data.updated_at).toLocaleDateString()}\n💻 Language: ${data.language || 'N/A'}\n\n🔗 ${data.html_url}` }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { image: { url: data.avatar_url }, caption: `👤 *GitHub: ${data.login}*\n\n📛 Name: ${data.name || 'N/A'}\n📝 Bio: ${data.bio || 'N/A'}\n📦 Repos: ${data.public_repos}\n👥 Followers: ${data.followers}\n\n🔗 ${data.html_url}` }, { quoted: msg });
        }
      } catch {
        await sock.sendMessage(jid, { text: `❌ GitHub profile/repo "${body}" not found.` }, { quoted: msg });
      }
    },
  },
  {
    name: 'imdb',
    alias: ['movie', 'film'],
    description: 'Search IMDB for movies/shows',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .imdb <title>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(body)}&apikey=trilogy&plot=short`, { timeout: 10000 });
        if (data.Response === 'False') return sock.sendMessage(jid, { text: `❌ "${body}" not found on IMDB.` }, { quoted: msg });
        const text = `🎬 *${data.Title} (${data.Year})*\n\n⭐ IMDB: ${data.imdbRating}/10\n🎭 Genre: ${data.Genre}\n⏱️ Runtime: ${data.Runtime}\n🌍 Country: ${data.Country}\n🗣️ Language: ${data.Language}\n📝 ${data.Plot}\n\n🏆 Awards: ${data.Awards}\n🎬 Director: ${data.Director}\n👥 Cast: ${data.Actors}`;
        if (data.Poster && data.Poster !== 'N/A') {
          await sock.sendMessage(jid, { image: { url: data.Poster }, caption: text }, { quoted: msg });
        } else {
          await sock.sendMessage(jid, { text }, { quoted: msg });
        }
      } catch {
        await sock.sendMessage(jid, { text: `❌ IMDB search failed.` }, { quoted: msg });
      }
    },
  },
  {
    name: 'anime',
    description: 'Search for anime information',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .anime <title>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(body)}&limit=1`, { timeout: 10000 });
        const a = data.data?.[0];
        if (!a) return sock.sendMessage(jid, { text: '❌ Anime not found.' }, { quoted: msg });
        const text = `🎌 *${a.title} (${a.title_english || a.title})*\n\n⭐ Score: ${a.score}/10\n📺 Type: ${a.type}\n📊 Status: ${a.status}\n📅 Year: ${a.year || 'N/A'}\n🔢 Episodes: ${a.episodes || 'Ongoing'}\n🎭 Genre: ${a.genres?.map(g => g.name).join(', ') || 'N/A'}\n📝 ${a.synopsis?.substring(0, 400)}...\n\n🔗 ${a.url}`;
        await sock.sendMessage(jid, { image: { url: a.images?.jpg?.large_image_url }, caption: text }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Anime search failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'wallpaper',
    alias: ['wp'],
    description: 'Search for wallpapers',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .wallpaper <search term>' }, { quoted: msg });
      try {
        const buffer = await fetchBuffer(`https://source.unsplash.com/1920x1080/?${encodeURIComponent(body)}`);
        await sock.sendMessage(jid, { image: buffer, caption: `🖼️ *Wallpaper: ${body}*\n\n_1920×1080 | Unsplash_` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ Wallpaper not found.` }, { quoted: msg });
      }
    },
  },
  {
    name: 'definition',
    alias: ['define', 'dict'],
    description: 'Get the definition of a word',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .define <word>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(body)}`, { timeout: 10000 });
        const word = data[0];
        const meanings = word.meanings?.slice(0, 2).map(m =>
          `📌 *${m.partOfSpeech}*\n${m.definitions.slice(0, 2).map((d, i) => `${i + 1}. ${d.definition}${d.example ? `\n   _Example: "${d.example}"_` : ''}`).join('\n')}`
        ).join('\n\n');
        const phonetic = word.phonetic || word.phonetics?.[0]?.text || '';
        await sock.sendMessage(jid, { text: `📖 *${word.word}* ${phonetic}\n\n${meanings}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ Definition not found for "${body}".` }, { quoted: msg });
      }
    },
  },
  {
    name: 'urban',
    alias: ['slang'],
    description: 'Search Urban Dictionary',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .urban <slang term>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(body)}`, { timeout: 10000 });
        const result = data.list?.[0];
        if (!result) return sock.sendMessage(jid, { text: '❌ Term not found on Urban Dictionary.' }, { quoted: msg });
        const def = result.definition.replace(/[\[\]]/g, '').substring(0, 500);
        const ex = result.example?.replace(/[\[\]]/g, '').substring(0, 300);
        await sock.sendMessage(jid, { text: `📖 *Urban: ${result.word}*\n\n📝 ${def}\n\n💬 Example:\n_${ex}_\n\n👍 ${result.thumbs_up} 👎 ${result.thumbs_down}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ Urban Dictionary search failed.` }, { quoted: msg });
      }
    },
  },
  {
    name: 'news',
    description: 'Get latest news headlines',
    async execute({ sock, msg, jid, args }) {
      const topic = args.join(' ') || 'world';
      try {
        const { data } = await axios.get(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&max=5&apikey=free`, { timeout: 10000 });
        const articles = data.articles?.slice(0, 5);
        if (!articles?.length) {
          return sock.sendMessage(jid, { text: `📰 *News: ${topic}*\n\n🔗 https://news.google.com/search?q=${encodeURIComponent(topic)}` }, { quoted: msg });
        }
        const text = `📰 *Latest News: ${topic}*\n\n` + articles.map((a, i) => `*${i + 1}.* ${a.title}\n🕐 ${new Date(a.publishedAt).toLocaleDateString()}\n🔗 ${a.url}`).join('\n\n');
        await sock.sendMessage(jid, { text }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `📰 *News: ${topic}*\n\n🔗 https://news.google.com/search?q=${encodeURIComponent(topic)}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'recipe',
    description: 'Search for a recipe',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .recipe <dish name>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(body)}`, { timeout: 10000 });
        const meal = data.meals?.[0];
        if (!meal) return sock.sendMessage(jid, { text: `❌ Recipe for "${body}" not found.` }, { quoted: msg });
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          if (meal[`strIngredient${i}`]) ingredients.push(`• ${meal[`strIngredient${i}`]} — ${meal[`strMeasure${i}`]}`);
        }
        const text = `🍳 *${meal.strMeal}*\n\n🌍 Cuisine: ${meal.strArea}\n🏷️ Category: ${meal.strCategory}\n\n🥘 *Ingredients:*\n${ingredients.slice(0, 10).join('\n')}\n\n📋 *Instructions:*\n${meal.strInstructions?.substring(0, 400)}...\n\n🎥 ${meal.strYoutube || ''}`;
        await sock.sendMessage(jid, { image: { url: meal.strMealThumb }, caption: text }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Recipe search failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'spell',
    description: 'Check spelling of a word',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .spell <word>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(body)}`);
        await sock.sendMessage(jid, { text: `✅ *"${body}"* is spelled correctly!\n\n📖 Definition: ${data[0]?.meanings?.[0]?.definitions?.[0]?.definition || 'N/A'}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `❌ *"${body}"* may be misspelled or not found in the dictionary.\n\n💡 Check: https://www.google.com/search?q=define+${encodeURIComponent(body)}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'emoji',
    description: 'Search for emoji information',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .emoji <emoji or name>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: `🔍 *Emoji Search: ${body}*\n\n📌 You searched for: ${body}\n🔗 https://emojipedia.org/search/?q=${encodeURIComponent(body)}` }, { quoted: msg });
    },
  },
  {
    name: 'manga',
    description: 'Search for manga information',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .manga <title>' }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(body)}&limit=1`, { timeout: 10000 });
        const m = data.data?.[0];
        if (!m) return sock.sendMessage(jid, { text: '❌ Manga not found.' }, { quoted: msg });
        const text = `📚 *${m.title}*\n\n⭐ Score: ${m.score}/10\n📊 Status: ${m.status}\n📖 Chapters: ${m.chapters || 'Ongoing'}\n🎭 Genre: ${m.genres?.map(g => g.name).join(', ') || 'N/A'}\n📝 ${m.synopsis?.substring(0, 400)}...\n\n🔗 ${m.url}`;
        await sock.sendMessage(jid, { image: { url: m.images?.jpg?.large_image_url }, caption: text }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Manga search failed.` }, { quoted: msg });
      }
    },
  },
];
