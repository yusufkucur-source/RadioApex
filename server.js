const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Hataları debug.log dosyasına yazmak için fonksiyon
function logError(message) {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(path.join(__dirname, 'debug.log'), logMessage);
}

const dev = false;
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

logError('Sunucu baslatiliyor...');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const appReady = app.prepare()
  .then(() => logError('Next.js hazir!'))
  .catch(err => {
    logError('Next.js HAZIRLANAMADI: ' + err.stack);
    process.exit(1);
  });

const server = createServer(async (req, res) => {
  logError(`Istek geldi: ${req.method} ${req.url}`);
  try {
    await appReady;
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    logError('ISTEK HATASI: ' + err.stack);
    res.statusCode = 500;
    res.end('Internal Server Error - Check debug.log');
  }
});

module.exports = server;