const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const config = require('../config');

// ─── Utility Functions ───────────────────────────────────────────────────────

async function fetchBuffer(url, options = {}) {
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer', ...options });
    return Buffer.from(data);
  } catch (err) {
    throw new Error(`fetchBuffer failed: ${err.message}`);
  }
}

async function fetchJson(url, options = {}) {
  const { data } = await axios.get(url, { responseType: 'json', ...options });
  return data;
}

async function postJson(url, body = {}, options = {}) {
  const { data } = await axios.post(url, body, options);
  return data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runtime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isUrl(text) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

function timeString(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
}

function datestamp() {
  const d = new Date();
  return d.toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'short', day: 'numeric' });
}

function timestamp() {
  const d = new Date();
  return d.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi', hour12: true });
}

function mention(num) {
  return `@${num.split('@')[0]}`;
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-\.]/gi, '_').substring(0, 100);
}

async function downloadFile(url, dest) {
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function deleteFile(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout.trim());
    });
  });
}

// ─── WhatsApp Helpers ─────────────────────────────────────────────────────────

function parseJid(text) {
  return text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
}

function getJidWithoutDevice(jid) {
  return jid ? jid.split(':')[0] : '';
}

function isGroup(jid) {
  return jid ? jid.endsWith('@g.us') : false;
}

async function getGroupMetadata(sock, jid) {
  try {
    return await sock.groupMetadata(jid);
  } catch {
    return null;
  }
}

async function isBotAdmin(sock, jid) {
  const meta = await getGroupMetadata(sock, jid);
  if (!meta) return false;
  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const admin = meta.participants.find(p => getJidWithoutDevice(p.id) === getJidWithoutDevice(botJid));
  return admin && (admin.admin === 'admin' || admin.admin === 'superadmin');
}

async function isAdmin(sock, jid, userId) {
  const meta = await getGroupMetadata(sock, jid);
  if (!meta) return false;
  const participant = meta.participants.find(p => getJidWithoutDevice(p.id) === getJidWithoutDevice(userId));
  return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
}

// ─── Text Utilities ───────────────────────────────────────────────────────────

function truncate(str, max = 100) {
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Fancy Text Converters ────────────────────────────────────────────────────

const fancyStyles = {
  bold: text => text.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1D3BF);
    if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1D3B9);
    return c;
  }).join(''),
  italic: text => text.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1D3D3);
    if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1D3CD);
    return c;
  }).join(''),
  bubble: text => text.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x24B6 - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x24D0 - 97);
    if (code >= 48 && code <= 57) return ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨'][code - 48];
    return c;
  }).join(''),
  flip: text => text.split('').reverse().map(c => {
    const flips = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ı', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z' };
    return flips[c.toLowerCase()] || c;
  }).join(''),
};

module.exports = {
  fetchBuffer, fetchJson, postJson, sleep, runtime, formatBytes,
  getRandomInt, pickRandom, isUrl, timeString, datestamp, timestamp,
  mention, sanitizeFilename, downloadFile, deleteFile, ensureDir,
  execPromise, parseJid, getJidWithoutDevice, isGroup, getGroupMetadata,
  isBotAdmin, isAdmin, truncate, capitalizeFirst, fancyStyles,
};
