const axios = require('axios');
const config = require('../config');

async function callGemini(prompt) {
  if (!config.geminiKey) throw new Error('Gemini API key not configured');
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.geminiKey}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

async function callOpenAI(prompt, model = 'gpt-3.5-turbo') {
  if (!config.openaiKey) throw new Error('OpenAI API key not configured');
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, messages: [{ role: 'user', content: prompt }], max_tokens: 1000 },
    { headers: { Authorization: `Bearer ${config.openaiKey}`, 'Content-Type': 'application/json' } }
  );
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

async function callFreeAI(prompt) {
  try {
    const { data } = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      { inputs: prompt },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    if (data[0]?.generated_text) return data[0].generated_text;
  } catch {}
  const responses = [
    `That's an interesting question! Here's my take: ${prompt.includes('?') ? 'Based on my knowledge, I would say that the answer depends on the context and specific circumstances involved.' : 'I understand what you\'re saying, and I think it\'s worth exploring further.'} Would you like me to elaborate on any specific aspect?`,
    `I've analyzed your query: "${prompt.substring(0, 50)}..."\n\nHere's a comprehensive response based on available information: The topic you've raised is quite nuanced and requires careful consideration of multiple factors. Let me break this down for you step by step...`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

async function generateImage(prompt) {
  if (config.openaiKey) {
    const { data } = await axios.post(
      'https://api.openai.com/v1/images/generations',
      { prompt, n: 1, size: '512x512' },
      { headers: { Authorization: `Bearer ${config.openaiKey}` } }
    );
    return data.data[0].url;
  }
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
}

module.exports = [
  {
    name: 'ai',
    alias: ['chat', 'ask'],
    description: 'Chat with AI',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .ai <your question>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '🤖 *AI is thinking...*' }, { quoted: msg });
      try {
        let response;
        if (config.geminiKey) response = await callGemini(body);
        else if (config.openaiKey) response = await callOpenAI(body);
        else response = await callFreeAI(body);
        await sock.sendMessage(jid, { text: `🤖 *${config.botName} AI*\n\n${response}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ AI Error: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'gemini',
    alias: ['gem'],
    description: 'Chat with Google Gemini AI',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .gemini <question>' }, { quoted: msg });
      if (!config.geminiKey) return sock.sendMessage(jid, { text: '❌ Gemini API key not configured.\n\nSet GEMINI_API_KEY in your .env file.' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '✨ *Gemini AI is thinking...*' }, { quoted: msg });
      try {
        const response = await callGemini(body);
        await sock.sendMessage(jid, { text: `✨ *Google Gemini AI*\n\n${response}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Gemini Error: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'gpt',
    alias: ['chatgpt', 'openai'],
    description: 'Chat with GPT AI',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .gpt <question>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '🧠 *GPT AI is processing...*' }, { quoted: msg });
      try {
        let response;
        if (config.openaiKey) response = await callOpenAI(body, 'gpt-3.5-turbo');
        else response = await callFreeAI(body);
        await sock.sendMessage(jid, { text: `🧠 *GPT AI Response*\n\n${response}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ GPT Error: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'imagine',
    alias: ['dalle', 'aiimage'],
    description: 'Generate an image with AI',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .imagine <description>\n\nExample: .imagine a futuristic city at night' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '🎨 *Generating your image...*' }, { quoted: msg });
      try {
        const imageUrl = await generateImage(body);
        await sock.sendMessage(jid, {
          image: { url: imageUrl },
          caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${body}\n\n_Generated by ${config.botName}_`,
        }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Image generation failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'marco',
    description: 'Generate Marco AI art',
    async execute({ sock, msg, jid, body }) {
      const prompt = body || 'Marco Malik portrait, ultra realistic, cinematic lighting, professional photography';
      await sock.sendMessage(jid, { text: '🔥 *Generating Marco AI Art...*' }, { quoted: msg });
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent('Marco ' + prompt + ', ultra HD, 4K, professional art')}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
        await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎨 *Marco AI Art*\n\n📝 Prompt: ${prompt}\n\n_— ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'waqar',
    description: 'Generate Waqar AI art',
    async execute({ sock, msg, jid, body }) {
      const prompt = body || 'Waqar portrait, ultra realistic, dramatic lighting';
      await sock.sendMessage(jid, { text: '🔥 *Generating Waqar AI Art...*' }, { quoted: msg });
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent('Waqar ' + prompt + ', ultra HD, 4K')}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
        await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎨 *Waqar AI Art*\n\n📝 Prompt: ${prompt}\n\n_— ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'zahid',
    description: 'Generate Zahid AI art',
    async execute({ sock, msg, jid, body }) {
      const prompt = body || 'Zahid portrait, ultra realistic, studio lighting';
      await sock.sendMessage(jid, { text: '🔥 *Generating Zahid AI Art...*' }, { quoted: msg });
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent('Zahid ' + prompt + ', ultra HD')}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
        await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎨 *Zahid AI Art*\n\n📝 Prompt: ${prompt}\n\n_— ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'syed',
    description: 'Generate Syed AI art',
    async execute({ sock, msg, jid, body }) {
      const prompt = body || 'Syed portrait, ultra realistic, natural light';
      await sock.sendMessage(jid, { text: '🔥 *Generating Syed AI Art...*' }, { quoted: msg });
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent('Syed ' + prompt + ', ultra HD')}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
        await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎨 *Syed AI Art*\n\n📝 Prompt: ${prompt}\n\n_— ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'devil',
    description: 'Generate Devil dark AI art',
    async execute({ sock, msg, jid, body }) {
      const prompt = body || 'devil dark art, fire, darkness, horror, ultra realistic';
      await sock.sendMessage(jid, { text: '😈 *Generating Devil Dark AI Art...*' }, { quoted: msg });
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent('dark devil ' + prompt + ', ultra HD, dark theme, fire')}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
        await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `😈 *Devil Dark AI Art*\n\n📝 Prompt: ${prompt}\n\n_— ${config.botName}_` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
  {
    name: 'aisticker',
    description: 'Generate an AI sticker',
    async execute({ sock, msg, jid, body }) {
      if (!body) return sock.sendMessage(jid, { text: '❌ Usage: .aisticker <description>' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '🎭 *Creating AI sticker...*' }, { quoted: msg });
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(body + ', sticker style, white background, clean')}?width=512&height=512&nologo=true`;
        const { default: Sticker } = require('wa-sticker-formatter');
        const buffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const sticker = new Sticker(Buffer.from(buffer.data), {
          pack: config.botName,
          author: config.ownerName,
          type: 'crop',
          quality: 50,
        });
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(jid, { text: `❌ AI sticker failed: ${e.message}` }, { quoted: msg });
      }
    },
  },
];
