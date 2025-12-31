// Plesk Phusion Passenger için Next.js başlatma dosyası
// Bu dosya Plesk'in Application startup file alanına yazılacak: server.js

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Production modunda çalış
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Next.js uygulamasını hazırla
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// app.prepare() promise'ini hemen başlat (bir kez çalıştırılacak)
const appReady = app.prepare();

// Passenger için server'ı hemen oluştur ve export et
// Passenger, server'ın hemen export edilmesini bekler
const server = createServer(async (req, res) => {
  try {
    // app.prepare() tamamlanana kadar bekle
    await appReady;
    
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('internal server error');
  }
});

// Passenger için server'ı export et
// Passenger, module.exports ile export edilen server'ı kullanır
module.exports = server;

// Uygulama hazır olduğunda log yaz
appReady.then(() => {
  console.log('> Next.js application is ready');
}).catch((err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

// Eğer doğrudan çalıştırılıyorsa (test için)
if (require.main === module) {
  app.prepare().then(() => {
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  });
}

