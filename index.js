// ═══════════════════════════════════════════════════════════════
//   MARCO MALIK MD — WhatsApp Bot v2.0.0
//   Author: Marco Malik
//   GitHub: https://github.com/marcomalik/marco-malik-md
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const chalk = require('chalk');
const { connectBot } = require('./connect');
const logger = require('./lib/logger');
const config = require('./config');
const { ensureDir } = require('./lib/functions');

// Ensure required directories exist
ensureDir('./session');
ensureDir('./temp');
ensureDir('./data');

// ─── Express Keep-Alive Server ────────────────────────────────────────────────
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'active',
    bot: config.botName,
    version: config.version,
    owner: config.ownerName,
    uptime: process.uptime(),
    message: '✅ MARCO MALIK MD is running!',
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(config.port, () => {
  logger.success(`Keep-alive server running on port ${config.port}`);
});

// ─── Bot Banner ───────────────────────────────────────────────────────────────
console.log(chalk.green(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║        🤖  MARCO MALIK MD  — v2.0.0  🤖         ║
║                                                  ║
║   Owner  : ${config.ownerName.padEnd(36)}║
║   Prefix : ${config.prefix.padEnd(36)}║
║   Mode   : ${config.mode.padEnd(36)}║
║   Port   : ${String(config.port).padEnd(36)}║
║                                                  ║
╚══════════════════════════════════════════════════╝
`));

// ─── Start Bot ────────────────────────────────────────────────────────────────
connectBot().catch(err => {
  logger.error('Fatal error starting bot:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.warn('Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
});
