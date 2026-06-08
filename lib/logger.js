const chalk = require('chalk');

const levels = { info: 'INFO', warn: 'WARN', error: 'ERROR', success: 'SUCCESS', debug: 'DEBUG' };

function prefix() {
  const d = new Date();
  return `[${d.toLocaleTimeString('en-US', { hour12: true })}]`;
}

const logger = {
  info: (...args) => console.log(chalk.cyan(prefix()), chalk.white(...args)),
  warn: (...args) => console.log(chalk.yellow(prefix()), chalk.yellow(...args)),
  error: (...args) => console.log(chalk.red(prefix()), chalk.red(...args)),
  success: (...args) => console.log(chalk.green(prefix()), chalk.green(...args)),
  debug: (...args) => console.log(chalk.magenta(prefix()), chalk.gray(...args)),
  bot: (event, detail = '') => console.log(
    chalk.bgGreen.black(' BOT '), chalk.cyan(event), detail ? chalk.gray('→ ' + detail) : ''
  ),
};

module.exports = logger;
