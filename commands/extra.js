const { pickRandom, getRandomInt, fetchBuffer } = require('../lib/functions');
const axios = require('axios');
const config = require('../config');

// ─── Additional 100+ commands ─────────────────────────────────────────────────

module.exports = [
  // ─── Social & Profile ──────────────────────────────────────────────────────
  {
    name: 'myinfo',
    alias: ['me', 'profile'],
    description: 'View your own profile info',
    async execute({ sock, msg, jid, senderJid, senderNum, isOwner }) {
      const { getUser } = require('../lib/database');
      const user = getUser(senderJid);
      await sock.sendMessage(jid, {
        text: `👤 *Your Profile*\n\n📱 Number: +${senderNum}\n👑 Role: ${isOwner ? 'Owner' : 'User'}\n⚠️ Warnings: ${user.warnings || 0}/3\n🚫 Banned: ${user.banned ? 'Yes' : 'No'}\n💎 Premium: ${user.premium ? 'Yes' : 'No'}`,
      }, { quoted: msg });
    },
  },
  {
    name: 'getpp',
    alias: ['pfp', 'dp'],
    description: 'Get someone\'s profile picture',
    async execute({ sock, msg, jid, mentioned, args }) {
      const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : jid);
      try {
        const pp = await sock.profilePictureUrl(target, 'image');
        const buffer = await fetchBuffer(pp);
        await sock.sendMessage(jid, {
          image: buffer,
          caption: `🖼️ *Profile Picture of @${target.split('@')[0]}*`,
          mentions: [target],
        }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ No profile picture found or it is private.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'setpp',
    alias: ['setprofilepic'],
    description: 'Set your profile picture',
    async execute({ sock, msg, jid, quoted }) {
      const q = quoted?.message || msg.message;
      if (!q?.imageMessage) return sock.sendMessage(jid, { text: '❌ Reply to an image.' }, { quoted: msg });
      try {
        const buffer = await sock.downloadMediaMessage(quoted || msg);
        await sock.updateProfilePicture(sock.user.id, buffer);
        await sock.sendMessage(jid, { text: '✅ Profile picture updated!' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'setbio',
    alias: ['setstatus'],
    description: 'Update bot\'s WhatsApp status',
    ownerOnly: true,
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .setbio <new status>' }, { quoted: msg });
      await sock.updateProfileStatus(body);
      await sock.sendMessage(jid, { text: `✅ Status updated to:\n_${body}_` }, { quoted: msg });
    },
  },

  // ─── Anti-features ─────────────────────────────────────────────────────────
  {
    name: 'anticall',
    description: 'Toggle anti-call feature',
    ownerOnly: true,
    async execute({ sock, msg, jid, args }) {
      config.antiCall = args[0] !== 'off';
      await sock.sendMessage(jid, { text: `📵 Anti-Call: *${config.antiCall ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },
  {
    name: 'antidelete',
    description: 'Toggle global anti-delete',
    ownerOnly: true,
    async execute({ sock, msg, jid, args }) {
      config.antiDelete = args[0] !== 'off';
      await sock.sendMessage(jid, { text: `🗑️ Anti-Delete (Global): *${config.antiDelete ? 'ON' : 'OFF'}*` }, { quoted: msg });
    },
  },

  // ─── Text Effects ──────────────────────────────────────────────────────────
  {
    name: 'fancy',
    description: 'Convert text to fancy style',
    async execute({ sock, msg, jid, args, body }) {
      const style = args[0];
      const { fancyStyles } = require('../lib/functions');
      if (!style || !fancyStyles[style]) {
        return sock.sendMessage(jid, { text: `🔤 Available styles: ${Object.keys(fancyStyles).join(', ')}\n\nUsage: .fancy bold Hello World` }, { quoted: msg });
      }
      const text = args.slice(1).join(' ');
      if (!text) return sock.sendMessage(jid, { text: '❌ Provide text to convert.' }, { quoted: msg });
      const result = fancyStyles[style](text);
      await sock.sendMessage(jid, { text: `🔤 *Fancy Text (${style}):*\n\n${result}` }, { quoted: msg });
    },
  },
  {
    name: 'bold',
    description: 'Make text bold (unicode)',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .bold <text>' }, { quoted: msg });
      const { fancyStyles } = require('../lib/functions');
      await sock.sendMessage(jid, { text: fancyStyles.bold(body) }, { quoted: msg });
    },
  },
  {
    name: 'italic',
    description: 'Make text italic (unicode)',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .italic <text>' }, { quoted: msg });
      const { fancyStyles } = require('../lib/functions');
      await sock.sendMessage(jid, { text: fancyStyles.italic(body) }, { quoted: msg });
    },
  },
  {
    name: 'bubble',
    description: 'Convert text to bubble style',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .bubble <text>' }, { quoted: msg });
      const { fancyStyles } = require('../lib/functions');
      await sock.sendMessage(jid, { text: fancyStyles.bubble(body) }, { quoted: msg });
    },
  },
  {
    name: 'fliptext',
    description: 'Flip/upside-down text',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .fliptext <text>' }, { quoted: msg });
      const { fancyStyles } = require('../lib/functions');
      await sock.sendMessage(jid, { text: fancyStyles.flip(body) }, { quoted: msg });
    },
  },

  // ─── Games ─────────────────────────────────────────────────────────────────
  {
    name: 'rps',
    alias: ['rockpaperscissors'],
    description: 'Play Rock Paper Scissors',
    async execute({ sock, msg, jid, args }) {
      const choices = ['rock', 'paper', 'scissors'];
      const user = args[0]?.toLowerCase();
      if (!choices.includes(user)) return sock.sendMessage(jid, { text: '❌ Usage: .rps rock|paper|scissors' }, { quoted: msg });
      const bot = pickRandom(choices);
      const emoji = { rock: '🪨', paper: '📄', scissors: '✂️' };
      let result = '🤝 Draw!';
      if ((user === 'rock' && bot === 'scissors') || (user === 'scissors' && bot === 'paper') || (user === 'paper' && bot === 'rock')) result = '🎉 You Win!';
      else if (user !== bot) result = '😔 Bot Wins!';
      await sock.sendMessage(jid, { text: `🎮 *Rock Paper Scissors!*\n\n👤 You: ${emoji[user]} ${user}\n🤖 Bot: ${emoji[bot]} ${bot}\n\n${result}` }, { quoted: msg });
    },
  },
  {
    name: 'number',
    alias: ['guessthenumber'],
    description: 'Guess a number between 1-100',
    async execute({ sock, msg, jid, args }) {
      const secret = getRandomInt(1, 100);
      const guess = parseInt(args[0]);
      if (isNaN(guess)) return sock.sendMessage(jid, { text: '🎮 *Guess a Number (1-100)!*\n\nUsage: .number <your guess>' }, { quoted: msg });
      const diff = Math.abs(secret - guess);
      let hint = guess < secret ? '📈 Too Low!' : '📉 Too High!';
      if (guess === secret) hint = '🎉 CORRECT! You\'re a genius!';
      else if (diff <= 5) hint += ' (Very close!)';
      await sock.sendMessage(jid, { text: `🎮 *Number Game!*\n\n🎯 Your guess: ${guess}\n🔢 Secret number: ${secret}\n\n${hint}` }, { quoted: msg });
    },
  },
  {
    name: 'trivia',
    description: 'Answer a trivia question',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 10000 });
        const q = data.results?.[0];
        if (!q) return sock.sendMessage(jid, { text: '❌ Could not fetch trivia.' }, { quoted: msg });
        const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
        const labels = ['A', 'B', 'C', 'D'];
        const text = `🧠 *Trivia!*\n\n📚 Category: ${q.category}\n⭐ Difficulty: ${q.difficulty}\n\n❓ ${q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}\n\n${answers.map((a, i) => `${labels[i]}) ${a.replace(/&quot;/g, '"').replace(/&#039;/g, "'")}`).join('\n')}\n\n||Answer: ${q.correct_answer.replace(/&quot;/g, '"')}||`;
        await sock.sendMessage(jid, { text }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Trivia service unavailable.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'hangman',
    description: 'Play a word guessing game',
    async execute({ sock, msg, jid, args }) {
      const words = ['JAVASCRIPT', 'WHATSAPP', 'PROGRAMMING', 'COMPUTER', 'INTERNET', 'ALGORITHM', 'DATABASE', 'NETWORK', 'SOFTWARE', 'DEVELOPER'];
      const word = pickRandom(words);
      const guess = args[0]?.toUpperCase();
      if (!guess) {
        const hidden = word.split('').map(() => '_').join(' ');
        return sock.sendMessage(jid, { text: `🪤 *Hangman!*\n\nWord: ${hidden} (${word.length} letters)\n\nUsage: .hangman <letter or word>` }, { quoted: msg });
      }
      const isCorrect = word.includes(guess) || guess === word;
      const revealed = word.split('').map(c => guess.includes(c) ? c : '_').join(' ');
      await sock.sendMessage(jid, { text: `🪤 *Hangman!*\n\n${isCorrect ? '✅ Correct!' : '❌ Wrong!'}\n\nWord: ${guess === word ? word : revealed}\n${guess === word ? '🎉 You Win!' : ''}` }, { quoted: msg });
    },
  },

  // ─── Generators ────────────────────────────────────────────────────────────
  {
    name: 'fakename',
    alias: ['randomname'],
    description: 'Generate a fake name',
    async execute({ sock, msg, jid, args }) {
      const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia', 'Kevin', 'Laura', 'Mike', 'Natalie', 'Oscar', 'Priya', 'Quinn', 'Rachel', 'Steve', 'Tina'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
      const name = `${pickRandom(firstNames)} ${pickRandom(lastNames)}`;
      const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
      await sock.sendMessage(jid, {
        text: `👤 *Random Profile*\n\n📛 Name: ${name}\n🌍 Country: ${pickRandom(countries)}\n📅 DOB: ${getRandomInt(1970, 2000)}-${String(getRandomInt(1, 12)).padStart(2, '0')}-${String(getRandomInt(1, 28)).padStart(2, '0')}\n📧 Email: ${name.toLowerCase().replace(' ', '.')}${getRandomInt(10, 99)}@email.com`,
      }, { quoted: msg });
    },
  },
  {
    name: 'fakecredit',
    alias: ['fakecardnumber'],
    description: 'Generate a test/fake credit card number (for testing only)',
    async execute({ sock, msg, jid }) {
      const types = [
        { name: 'Visa', prefix: '4', length: 16 },
        { name: 'MasterCard', prefix: '5', length: 16 },
        { name: 'Amex', prefix: '37', length: 15 },
      ];
      const type = pickRandom(types);
      let num = type.prefix;
      while (num.length < type.length - 1) num += getRandomInt(0, 9);
      let sum = 0;
      for (let i = num.length - 1; i >= 0; i -= 2) sum += parseInt(num[i]);
      for (let i = num.length - 2; i >= 0; i -= 2) { let d = parseInt(num[i]) * 2; sum += d > 9 ? d - 9 : d; }
      num += (10 - sum % 10) % 10;
      const exp = `${String(getRandomInt(1, 12)).padStart(2, '0')}/${getRandomInt(25, 30)}`;
      const cvv = String(getRandomInt(100, 999));
      await sock.sendMessage(jid, {
        text: `💳 *Test Card (NOT REAL)*\n\n🏦 Type: ${type.name}\n🔢 Number: ${num.match(/.{1,4}/g)?.join(' ')}\n📅 Expiry: ${exp}\n🔐 CVV: ${cvv}\n\n⚠️ _This is a randomly generated test number. Not for actual use._`,
      }, { quoted: msg });
    },
  },
  {
    name: 'morsedecoder',
    alias: ['decodemorse'],
    description: 'Decode Morse code to text',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .morsedecoder .... . .-.. .-.. ---' }, { quoted: msg });
      const morseMap = { '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9', '/': ' ' };
      const decoded = body.split(' ').map(c => morseMap[c] || c).join('');
      await sock.sendMessage(jid, { text: `📡 *Morse Decoded:*\n\nInput: ${body}\nOutput: *${decoded}*` }, { quoted: msg });
    },
  },
  {
    name: 'ascii',
    description: 'Convert text to ASCII art',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .ascii Hello' }, { quoted: msg });
      const map = { A: '█▀█', B: '█▀▄', C: '█▀▀', D: '█▀▄', E: '█▀▀', F: '█▀▀', G: '█▀▀', H: '█ █', I: '█', J: '  █', K: '█▄▀', L: '█  ', M: '█▄█', N: '█▄ █', O: '█▀█', P: '█▀█', Q: '█▀█', R: '█▀▄', S: '▄▀▀', T: '▀█▀', U: '█ █', V: '█ █', W: '█ █', X: '▀▄▀', Y: '▀▄▀', Z: '▀▄ ' };
      const result = body.toUpperCase().split('').map(c => map[c] || c).join(' ');
      await sock.sendMessage(jid, { text: `🔠 *ASCII Art:*\n\n${result}` }, { quoted: msg });
    },
  },
  {
    name: 'otp',
    alias: ['generateotp'],
    description: 'Generate an OTP code',
    async execute({ sock, msg, jid, args }) {
      const length = parseInt(args[0]) || 6;
      const otp = String(getRandomInt(Math.pow(10, length - 1), Math.pow(10, length) - 1));
      await sock.sendMessage(jid, { text: `🔐 *Generated OTP (${length} digits):*\n\n\`\`\`${otp}\`\`\`\n\n_Expires in 5 minutes_` }, { quoted: msg });
    },
  },
  {
    name: 'hex',
    description: 'Convert text to hex encoding',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .hex Hello' }, { quoted: msg });
      const hex = Buffer.from(body).toString('hex');
      await sock.sendMessage(jid, { text: `🔢 *Hex:*\n\n\`${hex}\`` }, { quoted: msg });
    },
  },
  {
    name: 'dehex',
    description: 'Decode hex to text',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .dehex 48656c6c6f' }, { quoted: msg });
      try {
        const text = Buffer.from(body, 'hex').toString('utf8');
        await sock.sendMessage(jid, { text: `🔓 *Hex Decoded:*\n\n${text}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Invalid hex string.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'abbreviation',
    alias: ['abbr', 'acronym'],
    description: 'Expand an abbreviation',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .abbr LOL' }, { quoted: msg });
      const abbrs = { LOL: 'Laugh Out Loud', BRB: 'Be Right Back', AFK: 'Away From Keyboard', IDK: 'I Don\'t Know', IRL: 'In Real Life', ASAP: 'As Soon As Possible', FYI: 'For Your Information', IMO: 'In My Opinion', IMHO: 'In My Humble Opinion', TBH: 'To Be Honest', BTW: 'By The Way', NGL: 'Not Gonna Lie', SMH: 'Shaking My Head', GOAT: 'Greatest Of All Time', OFC: 'Of Course', TMI: 'Too Much Information', YOLO: 'You Only Live Once', FOMO: 'Fear Of Missing Out', TBT: 'Throwback Thursday', DM: 'Direct Message', PM: 'Private Message', OP: 'Original Post/Poster', NFT: 'Non-Fungible Token', AI: 'Artificial Intelligence', API: 'Application Programming Interface' };
      const key = body.toUpperCase();
      const meaning = abbrs[key];
      await sock.sendMessage(jid, { text: meaning ? `📖 *${key}* = ${meaning}` : `❌ Abbreviation "${body}" not found in database.` }, { quoted: msg });
    },
  },
  {
    name: 'countdown',
    description: 'Countdown to a date',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .countdown 2025-12-31' }, { quoted: msg });
      const target = new Date(body);
      if (isNaN(target)) return sock.sendMessage(jid, { text: '❌ Invalid date format. Use YYYY-MM-DD.' }, { quoted: msg });
      const now = new Date();
      const diff = target - now;
      if (diff < 0) return sock.sendMessage(jid, { text: '❌ That date is in the past!' }, { quoted: msg });
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      await sock.sendMessage(jid, { text: `⏳ *Countdown to ${body}:*\n\n📅 ${days} days\n🕐 ${hours} hours\n⏱️ ${mins} minutes` }, { quoted: msg });
    },
  },
  {
    name: 'age',
    description: 'Calculate age from birth date',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .age 1999-05-15' }, { quoted: msg });
      const birth = new Date(body);
      if (isNaN(birth)) return sock.sendMessage(jid, { text: '❌ Invalid date. Use YYYY-MM-DD.' }, { quoted: msg });
      const now = new Date();
      const age = Math.floor((now - birth) / (365.25 * 24 * 3600 * 1000));
      await sock.sendMessage(jid, { text: `🎂 *Age Calculator*\n\n📅 Born: ${body}\n🎈 Age: *${age} years old*` }, { quoted: msg });
    },
  },
  {
    name: 'tinytext',
    description: 'Convert text to tiny superscript',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .tinytext Hello World' }, { quoted: msg });
      const tiny = { a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', q: '⁹', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
      const result = body.toLowerCase().split('').map(c => tiny[c] || c).join('');
      await sock.sendMessage(jid, { text: `🔡 *Tiny Text:*\n\n${result}` }, { quoted: msg });
    },
  },
  {
    name: 'capitalize',
    description: 'Capitalize every word',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .capitalize hello world' }, { quoted: msg });
      const result = body.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      await sock.sendMessage(jid, { text: `🔠 *Capitalized:*\n\n${result}` }, { quoted: msg });
    },
  },
  {
    name: 'randomquote',
    alias: ['rq'],
    description: 'Get a random programming quote',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://programming-quotes-api.vercel.app/quotes/random', { timeout: 10000 });
        await sock.sendMessage(jid, { text: `💻 *Programming Quote*\n\n"${data.en}"\n\n— ${data.author}` }, { quoted: msg });
      } catch {
        const quotes = [
          '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
          '"First, solve the problem. Then, write the code." — John Johnson',
          '"It\'s not a bug — it\'s an undocumented feature." — Anonymous',
          '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
          '"The best error message is the one that never shows up." — Thomas Fuchs',
        ];
        await sock.sendMessage(jid, { text: `💻 *Programming Quote*\n\n${pickRandom(quotes)}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'inspire',
    description: 'Get an inspirational image quote',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://zenquotes.io/api/random', { timeout: 10000 });
        const q = data[0];
        await sock.sendMessage(jid, {
          image: { url: `https://zenquotes.io/api/image/${q.q.replace(/ /g, '+')}/${q.a.replace(/ /g, '+')}` },
          caption: `✨ *"${q.q}"*\n\n— ${q.a}`,
        }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '✨ *"Believe in yourself and you will be unstoppable."*\n\n— Unknown' }, { quoted: msg });
      }
    },
  },
  {
    name: 'bmi',
    description: 'Calculate Body Mass Index',
    async execute({ sock, msg, jid, args }) {
      const [weight, height] = args.map(Number);
      if (!weight || !height) return sock.sendMessage(jid, { text: '❌ Usage: .bmi <weight kg> <height cm>\n\nExample: .bmi 70 175' }, { quoted: msg });
      const h = height / 100;
      const bmi = (weight / (h * h)).toFixed(1);
      let category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
      let emoji = bmi < 18.5 ? '📉' : bmi < 25 ? '✅' : bmi < 30 ? '⚠️' : '❗';
      await sock.sendMessage(jid, { text: `🏋️ *BMI Calculator*\n\n⚖️ Weight: ${weight} kg\n📏 Height: ${height} cm\n\n📊 BMI: *${bmi}*\n${emoji} Category: *${category}*` }, { quoted: msg });
    },
  },
  {
    name: 'tip',
    description: 'Calculate tip for a bill',
    async execute({ sock, msg, jid, args }) {
      const [bill, tipPercent, people] = args.map(Number);
      if (!bill) return sock.sendMessage(jid, { text: '❌ Usage: .tip <bill> <tip%> <people>\n\nExample: .tip 100 15 4' }, { quoted: msg });
      const tp = tipPercent || 15;
      const p = people || 1;
      const tipAmount = (bill * tp / 100).toFixed(2);
      const total = (bill + parseFloat(tipAmount)).toFixed(2);
      const perPerson = (parseFloat(total) / p).toFixed(2);
      await sock.sendMessage(jid, { text: `💰 *Tip Calculator*\n\n🧾 Bill: $${bill.toFixed(2)}\n💡 Tip (${tp}%): $${tipAmount}\n💵 Total: $${total}\n👥 Per Person (${p}): $${perPerson}` }, { quoted: msg });
    },
  },
  {
    name: 'temperature',
    alias: ['temp'],
    description: 'Convert temperature units',
    async execute({ sock, msg, jid, args }) {
      const value = parseFloat(args[0]);
      const from = args[1]?.toLowerCase();
      if (isNaN(value) || !from) return sock.sendMessage(jid, { text: '❌ Usage: .temperature <value> <c|f|k>\n\nExample: .temperature 100 c' }, { quoted: msg });
      let c, f, k;
      if (from === 'c') { c = value; f = c * 9 / 5 + 32; k = c + 273.15; }
      else if (from === 'f') { f = value; c = (f - 32) * 5 / 9; k = c + 273.15; }
      else if (from === 'k') { k = value; c = k - 273.15; f = c * 9 / 5 + 32; }
      else return sock.sendMessage(jid, { text: '❌ Invalid unit. Use c, f, or k.' }, { quoted: msg });
      await sock.sendMessage(jid, { text: `🌡️ *Temperature Converter*\n\n🌡️ Celsius: ${c.toFixed(2)}°C\n🌡️ Fahrenheit: ${f.toFixed(2)}°F\n🌡️ Kelvin: ${k.toFixed(2)}K` }, { quoted: msg });
    },
  },

  // ─── Fun extras ────────────────────────────────────────────────────────────
  {
    name: 'cat',
    description: 'Get a random cat image',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 });
        const buffer = await fetchBuffer(data[0].url);
        await sock.sendMessage(jid, { image: buffer, caption: '🐱 *Meow!*' }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Could not fetch cat image.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'dog',
    description: 'Get a random dog image',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 });
        const buffer = await fetchBuffer(data.message);
        await sock.sendMessage(jid, { image: buffer, caption: '🐶 *Woof!*' }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Could not fetch dog image.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'fox',
    description: 'Get a random fox image',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://randomfox.ca/floof/', { timeout: 10000 });
        const buffer = await fetchBuffer(data.image);
        await sock.sendMessage(jid, { image: buffer, caption: '🦊 *Fox!*' }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Could not fetch fox image.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'duck',
    description: 'Get a random duck image',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://random-d.uk/api/v2/random', { timeout: 10000 });
        const buffer = await fetchBuffer(data.url);
        await sock.sendMessage(jid, { image: buffer, caption: '🦆 *Quack!*' }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Could not fetch duck image.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'randomcolor',
    alias: ['rc'],
    description: 'Generate a random color',
    async execute({ sock, msg, jid }) {
      const r = getRandomInt(0, 255), g = getRandomInt(0, 255), b = getRandomInt(0, 255);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      const imageUrl = `https://singlecolorimage.com/get/${hex.replace('#', '')}/200x200`;
      const buffer = await fetchBuffer(imageUrl).catch(() => null);
      const text = `🎨 *Random Color*\n\n🔵 HEX: ${hex}\n🔴 RGB: rgb(${r}, ${g}, ${b})`;
      if (buffer) {
        await sock.sendMessage(jid, { image: buffer, caption: text }, { quoted: msg });
      } else {
        await sock.sendMessage(jid, { text }, { quoted: msg });
      }
    },
  },
  {
    name: 'dadjoke',
    description: 'Get a dad joke',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' }, timeout: 10000 });
        await sock.sendMessage(jid, { text: `👨 *Dad Joke!*\n\n${data.joke} 😄` }, { quoted: msg });
      } catch {
        const jokes = ['Why do cows wear bells? Because their horns don\'t work!', 'What do you call a sleeping dinosaur? A dino-snore!', 'Why don\'t scientists trust atoms? Because they make up everything!'];
        await sock.sendMessage(jid, { text: `👨 *Dad Joke!*\n\n${pickRandom(jokes)}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'numberfact',
    alias: ['nf'],
    description: 'Get a fact about a number',
    async execute({ sock, msg, jid, args }) {
      const num = args[0] || getRandomInt(1, 1000);
      try {
        const { data } = await axios.get(`http://numbersapi.com/${num}/trivia`, { timeout: 10000 });
        await sock.sendMessage(jid, { text: `🔢 *Number Fact: ${num}*\n\n${data}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `🔢 *Number Fact: ${num}*\n\n${num} is just a number, but every number has a story!` }, { quoted: msg });
      }
    },
  },
  {
    name: 'advice',
    description: 'Get a random piece of advice',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://api.adviceslip.com/advice', { timeout: 10000 });
        await sock.sendMessage(jid, { text: `💡 *Advice #${data.slip.id}*\n\n"${data.slip.advice}"` }, { quoted: msg });
      } catch {
        const advices = [
          'Take breaks often. Productivity decreases without rest.',
          'Always back up your data. You\'ll thank yourself later.',
          'Drink more water. Most people are mildly dehydrated.',
          'Call a friend you haven\'t spoken to in a while.',
          'Learn something new every day — even just one thing.',
        ];
        await sock.sendMessage(jid, { text: `💡 *Advice*\n\n"${pickRandom(advices)}"` }, { quoted: msg });
      }
    },
  },
  {
    name: 'chucknorris',
    alias: ['chuck'],
    description: 'Get a Chuck Norris joke',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://api.chucknorris.io/jokes/random', { timeout: 10000 });
        await sock.sendMessage(jid, { text: `💪 *Chuck Norris Fact!*\n\n${data.value}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '💪 *Chuck Norris Fact!*\n\nChuck Norris can divide by zero.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'xkcd',
    description: 'Get a random XKCD comic',
    async execute({ sock, msg, jid }) {
      try {
        const { data: latest } = await axios.get('https://xkcd.com/info.0.json', { timeout: 10000 });
        const num = getRandomInt(1, latest.num);
        const { data: comic } = await axios.get(`https://xkcd.com/${num}/info.0.json`, { timeout: 10000 });
        const buffer = await fetchBuffer(comic.img);
        await sock.sendMessage(jid, { image: buffer, caption: `📰 *XKCD #${comic.num}: ${comic.title}*\n\n${comic.alt}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Could not fetch XKCD comic.' }, { quoted: msg });
      }
    },
  },
  {
    name: 'flag',
    description: 'Get a country flag image',
    async execute({ sock, msg, jid, args }) {
      const country = args.join('-').toLowerCase() || 'us';
      const buffer = await fetchBuffer(`https://flagcdn.com/w320/${country}.png`).catch(() => null);
      if (!buffer) return sock.sendMessage(jid, { text: '❌ Flag not found. Use country code (e.g., .flag pk)' }, { quoted: msg });
      await sock.sendMessage(jid, { image: buffer, caption: `🏳️ *Flag: ${country.toUpperCase()}*` }, { quoted: msg });
    },
  },

  // ─── Bot management extras ─────────────────────────────────────────────────
  {
    name: 'afk',
    description: 'Set yourself as AFK',
    async execute({ sock, msg, jid, senderNum, body }) {
      const reason = body || 'No reason given';
      const { saveUser } = require('../lib/database');
      saveUser(senderNum + '@s.whatsapp.net', { afk: true, afkReason: reason, afkTime: Date.now() });
      await sock.sendMessage(jid, { text: `🌙 *You are now AFK!*\n\n📝 Reason: ${reason}\n\n_People will be notified when they mention you._` }, { quoted: msg });
    },
  },
  {
    name: 'welcome',
    description: 'Show welcome message to yourself',
    async execute({ sock, msg, jid, senderNum }) {
      await sock.sendMessage(jid, {
        text: `✨ *Welcome!*\n\nHey @${senderNum}! Welcome to *${config.botName}*!\n\n📌 Type *${config.prefix}menu* to see all commands.\n💬 Prefix: *${config.prefix}*\n\n_Enjoy using the bot!_ 🎉`,
        mentions: [senderNum + '@s.whatsapp.net'],
      }, { quoted: msg });
    },
  },
  {
    name: 'donate',
    alias: ['support'],
    description: 'Support the bot developer',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, {
        text: `❤️ *Support ${config.botName}!*\n\n🙏 If you enjoy using this bot, consider supporting the developer!\n\n💰 *Donate via:*\n• PayPal: paypal.me/marcomalik\n• JazzCash: 0300-XXXXXXX\n• EasyPaisa: 0300-XXXXXXX\n\n📢 *Join Channel:* ${config.channelLink}\n\n_Every contribution helps keep the bot alive!_ ❤️`,
      }, { quoted: msg });
    },
  },
  {
    name: 'report',
    alias: ['feedback'],
    description: 'Send a report/feedback to the owner',
    async execute({ sock, msg, jid, senderNum, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .report <your feedback/issue>' }, { quoted: msg });
      await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, {
        text: `📋 *New Report/Feedback*\n\n👤 From: +${senderNum}\n💬 Message:\n${body}\n\n⏰ Time: ${new Date().toLocaleString()}`,
      });
      await sock.sendMessage(jid, { text: '✅ Your report has been sent to the owner. Thank you!' }, { quoted: msg });
    },
  },
  {
    name: 'premium',
    description: 'Check premium status or info',
    async execute({ sock, msg, jid, senderJid }) {
      const { getUser } = require('../lib/database');
      const user = getUser(senderJid);
      await sock.sendMessage(jid, {
        text: user.premium
          ? `💎 *Premium Status: ACTIVE*\n\n✅ You are a premium user!\n🎁 Enjoy exclusive features!`
          : `💎 *Premium Features*\n\n🚫 You are not a premium user.\n\n📩 Contact the owner for premium access:\n${config.ownerNumber}`,
      }, { quoted: msg });
    },
  },
  {
    name: 'channels',
    description: 'Show official channels',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, {
        text: `📡 *Official Channels*\n\n🔗 WhatsApp Channel: ${config.channelLink}\n\n_Join to stay updated with bot news and features!_ 🤖`,
      }, { quoted: msg });
    },
  },
];
