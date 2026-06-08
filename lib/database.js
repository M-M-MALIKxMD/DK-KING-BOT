const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

function readDb(name) {
  const file = path.join(DB_PATH, `${name}.json`);
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function writeDb(name, data) {
  const file = path.join(DB_PATH, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getUser(jid) {
  const db = readDb('users');
  if (!db[jid]) db[jid] = { jid, warnings: 0, banned: false, premium: false, coins: 0, xp: 0 };
  return db[jid];
}

function saveUser(jid, data) {
  const db = readDb('users');
  db[jid] = { ...db[jid], ...data };
  writeDb('users', db);
}

function getGroup(jid) {
  const db = readDb('groups');
  if (!db[jid]) db[jid] = { jid, antiLink: false, antiSpam: false, antiDelete: false, welcome: false, goodbye: false };
  return db[jid];
}

function saveGroup(jid, data) {
  const db = readDb('groups');
  db[jid] = { ...db[jid], ...data };
  writeDb('groups', db);
}

function getSettings() {
  const db = readDb('settings');
  return db;
}

function saveSetting(key, value) {
  const db = readDb('settings');
  db[key] = value;
  writeDb('settings', db);
}

function addWarn(jid) {
  const u = getUser(jid);
  u.warnings = (u.warnings || 0) + 1;
  saveUser(jid, u);
  return u.warnings;
}

function resetWarn(jid) {
  saveUser(jid, { warnings: 0 });
}

function banUser(jid) {
  saveUser(jid, { banned: true });
}

function unbanUser(jid) {
  saveUser(jid, { banned: false });
}

function isUserBanned(jid) {
  return getUser(jid).banned === true;
}

// Spam tracker
const spamMap = new Map();
function checkSpam(jid, limit = 5, interval = 10000) {
  const now = Date.now();
  const entry = spamMap.get(jid) || { count: 0, last: now };
  if (now - entry.last > interval) { entry.count = 1; entry.last = now; }
  else entry.count++;
  spamMap.set(jid, entry);
  return entry.count > limit;
}

// Deleted messages store
const deletedMessages = new Map();
function storeMessage(key, msg) { deletedMessages.set(key, msg); }
function getDeletedMessage(key) { return deletedMessages.get(key) || null; }

module.exports = {
  readDb, writeDb, getUser, saveUser, getGroup, saveGroup,
  getSettings, saveSetting, addWarn, resetWarn, banUser, unbanUser,
  isUserBanned, checkSpam, storeMessage, getDeletedMessage,
};
