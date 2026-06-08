const { pickRandom, getRandomInt } = require('../lib/functions');
const axios = require('axios');

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😂",
  "I told my wife she was drawing her eyebrows too high. She looked surprised. 😏",
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  "What do you call fake spaghetti? An impasta! 🍝",
  "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "I'm on a seafood diet. I see food and I eat it! 🍕",
  "Why did the bicycle fall over? Because it was two-tired! 🚲",
  "What did the ocean say to the beach? Nothing, it just waved! 🌊",
  "I used to hate facial hair, but then it grew on me! 😄",
  "Why can't you give Elsa a balloon? She'll let it go! ❄️",
  "How do you organize a space party? You planet! 🚀",
  "Why did the math book look sad? It had too many problems! 📚",
  "What do you call a sleeping dinosaur? A dino-snore! 🦕",
  "I told a chemistry joke — no reaction! ⚗️",
  "Why can't a nose be 12 inches long? Because then it would be a foot! 👃",
  "What's a vampire's favourite fruit? A blood orange! 🧛",
  "Why did the computer go to the doctor? It had a virus! 💻",
  "What do lawyers wear to court? Lawsuits! ⚖️",
  "I asked my dog what 2 minus 2 is. He said nothing! 🐶",
];

const facts = [
  "Honey never expires. Archaeologists have found 3000-year-old honey in Egyptian tombs! 🍯",
  "A group of flamingos is called a 'flamboyance'! 🦩",
  "Octopuses have three hearts and blue blood! 🐙",
  "Bananas are slightly radioactive due to their potassium content! 🍌",
  "The Eiffel Tower grows about 15cm taller in summer! 🗼",
  "Crows can recognize human faces and hold grudges! 🐦",
  "A day on Venus is longer than a year on Venus! 🌍",
  "There are more possible chess games than atoms in the observable universe! ♟️",
  "Sharks are older than trees! 🦈",
  "Cleopatra lived closer to the Moon landing than to the building of the pyramids! 🌙",
  "A bolt of lightning is 5× hotter than the surface of the Sun! ⚡",
  "Butterflies taste with their feet! 🦋",
  "The human nose can detect over 1 trillion different smells! 👃",
  "Wombat poop is cube-shaped! 🐨",
  "A snail can sleep for 3 years! 🐌",
];

const quotes = [
  '"The only way to do great work is to love what you do." — Steve Jobs',
  '"In the middle of every difficulty lies opportunity." — Albert Einstein',
  '"Life is what happens when you\'re busy making other plans." — John Lennon',
  '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
  '"Success is not final, failure is not fatal." — Winston Churchill',
  '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
  '"It does not matter how slowly you go as long as you do not stop." — Confucius',
  '"Everything you\'ve ever wanted is on the other side of fear." — George Addair',
  '"Dream big and dare to fail." — Norman Vaughan',
  '"The best time to plant a tree was 20 years ago. The second best is now." — Proverb',
];

const dares = [
  "Send a voice note saying 'I love pineapple on pizza'!",
  "Change your WhatsApp bio to 'I lost a dare' for 1 hour!",
  "Text your last contact saying 'I miss you'!",
  "Send a selfie with a funny face!",
  "Call someone and sing Happy Birthday to them!",
  "Type only in CAPS for the next 5 messages!",
  "Post 'I am beautiful' as your status!",
  "Send a 30-second voice note of you singing your favourite song!",
  "Share your most embarrassing photo!",
  "DM someone random 'You owe me $100'!",
];

const truths = [
  "What is your most embarrassing moment?",
  "Have you ever lied to get out of trouble?",
  "What is your biggest secret?",
  "Who is your crush?",
  "Have you ever cheated in an exam?",
  "What is the most embarrassing thing you've searched on Google?",
  "Have you ever talked about someone behind their back?",
  "What is your biggest fear?",
  "Have you ever stolen something?",
  "What's the most childish thing you still do?",
];

const rizz = [
  "Are you a magician? Because whenever I look at you, everyone else disappears! ✨",
  "Do you have a map? I keep getting lost in your eyes! 🗺️",
  "Is your name Google? Because you have everything I've been searching for! 🔍",
  "Are you a parking ticket? Because you've got 'fine' written all over you! 🎫",
  "Do you believe in love at first sight, or should I walk by again? 💝",
  "Are you a bank loan? Because you have my interest! 💰",
  "If you were a vegetable, you'd be a cute-cumber! 🥒",
  "Is your name Ariel? Because we mermaid for each other! 🧜",
  "Are you a camera? Because every time I look at you, I smile! 📷",
  "Your hand looks heavy — can I hold it for you? 🤝",
];

const pickupLines = [
  "Do you like science? Because I've got chemistry with you! ⚗️",
  "Are you from Tennessee? Because you're the only ten I see! 🌟",
  "If you were a fruit, you'd be a fineapple! 🍍",
  "You must be a broom, because you swept me off my feet! 🧹",
  "Is your name Wi-Fi? Because I'm feeling a connection! 📡",
];

const compliments = [
  "You're absolutely amazing! 🌟",
  "Your smile can light up any room! ✨",
  "You're one in a million! 💎",
  "The world is a better place with you in it! 🌍",
  "You have an incredible energy about you! ⚡",
  "You make every situation better just by being there! 🎯",
  "Your kindness is contagious! ❤️",
  "You are stronger than you know! 💪",
];

module.exports = [
  {
    name: 'joke',
    alias: ['j'],
    description: 'Get a random joke',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `😂 *Joke of the Day!*\n\n${pickRandom(jokes)}` }, { quoted: msg });
    },
  },
  {
    name: 'fact',
    alias: ['facts'],
    description: 'Get a random interesting fact',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `🧠 *Random Fact!*\n\n${pickRandom(facts)}` }, { quoted: msg });
    },
  },
  {
    name: 'quote',
    alias: ['quotes', 'inspire'],
    description: 'Get an inspirational quote',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `💬 *Quote of the Day!*\n\n${pickRandom(quotes)}` }, { quoted: msg });
    },
  },
  {
    name: 'dare',
    description: 'Get a random dare',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `😈 *Dare!*\n\n${pickRandom(dares)}` }, { quoted: msg });
    },
  },
  {
    name: 'truth',
    description: 'Get a random truth question',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `🤔 *Truth!*\n\n${pickRandom(truths)}` }, { quoted: msg });
    },
  },
  {
    name: 'roast',
    description: 'Roast someone',
    async execute({ sock, msg, jid, mentioned, args }) {
      const target = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : (args[0] || 'you');
      const roasts = [
        `${target}, you're the reason they put directions on shampoo! 💆`,
        `${target}'s so slow, it takes them an hour to watch 60 Minutes! 🐢`,
        `${target} has the face only a mother could love — on a bad day! 😬`,
        `If ${target} was any more average, they'd be a pie chart! 📊`,
        `${target}'s brain is so small, it could sit in a nutshell and rattle! 🐿️`,
      ];
      await sock.sendMessage(jid, { text: `🔥 *Roasted!*\n\n${pickRandom(roasts)}`, mentions: mentioned }, { quoted: msg });
    },
  },
  {
    name: 'ship',
    alias: ['love'],
    description: 'Ship two people together',
    async execute({ sock, msg, jid, mentioned, args }) {
      const person1 = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : args[0] || 'Person1';
      const person2 = mentioned[1] ? `@${mentioned[1].split('@')[0]}` : args[1] || 'Person2';
      const percent = getRandomInt(1, 100);
      const hearts = '❤️'.repeat(Math.floor(percent / 20));
      await sock.sendMessage(jid, {
        text: `💕 *Ship Calculator!*\n\n${person1} 💞 ${person2}\n\nCompatibility: *${percent}%*\n${hearts}\n\n${percent > 70 ? '🥰 Perfect match!' : percent > 40 ? '💛 Good vibes!' : '😅 Needs work!'}`,
        mentions: mentioned,
      }, { quoted: msg });
    },
  },
  {
    name: 'rate',
    description: 'Rate someone out of 10',
    async execute({ sock, msg, jid, mentioned, body }) {
      const target = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : body || 'you';
      const rating = getRandomInt(1, 10);
      const emoji = rating >= 8 ? '🤩' : rating >= 5 ? '😊' : '😬';
      await sock.sendMessage(jid, {
        text: `⭐ *Rating!*\n\n${target}: *${rating}/10* ${emoji}\n\n${'⭐'.repeat(rating)}${'☆'.repeat(10 - rating)}`,
        mentions: mentioned,
      }, { quoted: msg });
    },
  },
  {
    name: 'roll',
    alias: ['dice'],
    description: 'Roll a dice',
    async execute({ sock, msg, jid, args }) {
      const sides = parseInt(args[0]) || 6;
      const result = getRandomInt(1, sides);
      await sock.sendMessage(jid, { text: `🎲 *Dice Roll (d${sides}):* ${result}` }, { quoted: msg });
    },
  },
  {
    name: 'flip',
    alias: ['coinflip'],
    description: 'Flip a coin',
    async execute({ sock, msg, jid }) {
      const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
      await sock.sendMessage(jid, { text: `🪙 *Coin Flip:* ${result}` }, { quoted: msg });
    },
  },
  {
    name: '8ball',
    alias: ['magic8ball'],
    description: 'Ask the magic 8-ball',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Ask a question!\n\nUsage: .8ball Will I win the lottery?' }, { quoted: msg });
      const answers = ['Yes! ✅', 'No! ❌', 'Maybe... 🤔', 'Definitely! 💯', 'Absolutely not! 🚫', 'Signs point to yes! 🌟', 'Ask again later... ⏳', 'Without a doubt! ✨', 'Very unlikely! 🙅', 'It is certain! 🎯'];
      await sock.sendMessage(jid, { text: `🎱 *Magic 8-Ball*\n\n❓ Q: ${body}\n💬 A: ${pickRandom(answers)}` }, { quoted: msg });
    },
  },
  {
    name: 'rizz',
    description: 'Get a rizz line',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `😎 *Rizz Line!*\n\n${pickRandom(rizz)}` }, { quoted: msg });
    },
  },
  {
    name: 'pickup',
    description: 'Get a pickup line',
    async execute({ sock, msg, jid }) {
      await sock.sendMessage(jid, { text: `💘 *Pickup Line!*\n\n${pickRandom(pickupLines)}` }, { quoted: msg });
    },
  },
  {
    name: 'wyr',
    alias: ['wouldyourather'],
    description: 'Would you rather?',
    async execute({ sock, msg, jid }) {
      const wyr = [
        ['be invisible', 'be able to fly'],
        ['know the future', 'change the past'],
        ['be super smart', 'be super strong'],
        ['live without music', 'live without internet'],
        ['always be cold', 'always be hot'],
        ['speak all languages', 'play all instruments'],
        ['fight 100 duck-sized horses', 'fight 1 horse-sized duck'],
        ['have no sleep', 'never dream'],
      ];
      const [a, b] = pickRandom(wyr);
      await sock.sendMessage(jid, { text: `🤔 *Would You Rather?*\n\nA) ${a}\n\n*or*\n\nB) ${b}` }, { quoted: msg });
    },
  },
  {
    name: 'nhie',
    alias: ['neverhaveiever'],
    description: 'Never have I ever...',
    async execute({ sock, msg, jid }) {
      const nhie = [
        'Never have I ever lied about my age! 🤥',
        'Never have I ever stalked someone on social media! 👀',
        'Never have I ever broken a bone! 🦴',
        'Never have I ever eaten food off the floor! 🍕',
        'Never have I ever skipped school/work! 🏫',
        'Never have I ever sent a text to the wrong person! 📱',
        'Never have I ever fallen asleep in class! 😴',
      ];
      await sock.sendMessage(jid, { text: `😇 *Never Have I Ever!*\n\n${pickRandom(nhie)}\n\n🤚 Raise your hand if you have!` }, { quoted: msg });
    },
  },
  {
    name: 'compliment',
    description: 'Get a compliment',
    async execute({ sock, msg, jid, mentioned }) {
      const target = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : 'You';
      await sock.sendMessage(jid, {
        text: `💝 *Compliment!*\n\n${target}: ${pickRandom(compliments)}`,
        mentions: mentioned,
      }, { quoted: msg });
    },
  },
  {
    name: 'meme',
    description: 'Get a random meme',
    async execute({ sock, msg, jid }) {
      try {
        const { data } = await axios.get('https://meme-api.com/gimme');
        await sock.sendMessage(jid, {
          image: { url: data.url },
          caption: `😂 *${data.title}*\n\n👍 ${data.ups} upvotes\n📌 r/${data.subreddit}`,
        }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: '❌ Could not fetch a meme. Try again later!' }, { quoted: msg });
      }
    },
  },
  {
    name: 'horoscope',
    description: 'Get your horoscope',
    async execute({ sock, msg, jid, args }) {
      const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      const sign = args[0]?.toLowerCase();
      if (!sign || !signs.includes(sign)) {
        return sock.sendMessage(jid, { text: `⭐ *Horoscope Signs:*\n\n${signs.join(', ')}\n\nUsage: .horoscope aries` }, { quoted: msg });
      }
      try {
        const { data } = await axios.get(`https://ohmanda.com/api/horoscope/${sign}`);
        await sock.sendMessage(jid, { text: `♈ *${sign.toUpperCase()} Horoscope*\n\n${data.horoscope}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(jid, { text: `🌟 *${sign.toUpperCase()} — Today's Horoscope:*\n\nThe stars align in your favor today! Take bold steps toward your dreams and trust your instincts. Good fortune is on its way! ⭐` }, { quoted: msg });
      }
    },
  },
  {
    name: 'insult',
    description: 'Get a funny insult',
    async execute({ sock, msg, jid, mentioned }) {
      const target = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : 'you';
      const insults = [
        `${target} is so slow they got lapped by a parked car! 🐢`,
        `${target} is so forgetful, they introduced themselves to their own reflection! 🪞`,
        `${target}'s cooking is so bad, the flies chipped in to fix the screen door! 🪟`,
        `${target} is like a software update — nobody wants them but they keep coming! 💻`,
      ];
      await sock.sendMessage(jid, { text: `😜 *Funny Insult!*\n\n${pickRandom(insults)}`, mentions: mentioned }, { quoted: msg });
    },
  },
  {
    name: 'guess',
    description: 'Guess a number game',
    async execute({ sock, msg, jid, args }) {
      const secret = getRandomInt(1, 10);
      const guess = parseInt(args[0]);
      if (isNaN(guess)) return sock.sendMessage(jid, { text: '🎮 *Guess the number!*\n\nI am thinking of a number between 1–10.\n\nUsage: .guess <number>' }, { quoted: msg });
      await sock.sendMessage(jid, {
        text: guess === secret
          ? `🎉 *Correct!* The number was *${secret}*! You guessed it! 🏆`
          : `❌ *Wrong!* The number was *${secret}*. Better luck next time! 😅`,
      }, { quoted: msg });
    },
  },
];
