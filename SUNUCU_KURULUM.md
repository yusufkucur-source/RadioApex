# RadioApex Sunucu Kurulum Dokümantasyonu

Bu dokümantasyon, RadioApex web sitesinin sunucuda kurulumu ve yapılandırması için gerekli tüm bilgileri içerir.

## 📋 İçindekiler

1. [Sunucu Gereksinimleri](#sunucu-gereksinimleri)
2. [Kurulum Adımları](#kurulum-adımları)
3. [Yapılandırma](#yapılandırma)
4. [Yaygın Hatalar ve Çözümleri](#yaygın-hatalar-ve-çözümleri)
5. [PM2 ile Çalıştırma](#pm2-ile-çalıştırma)
6. [Nginx Yapılandırması](#nginx-yapılandırması)
7. [Güncelleme İşlemi](#güncelleme-işlemi)

---

## 🖥️ Sunucu Gereksinimleri

### Zorunlu Yazılımlar

#### 1. Node.js 18+ ve npm

**Ubuntu/Debian için:**
```bash
# Node.js 18.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versiyon kontrolü
node --version  # v18.x.x veya üzeri olmalı
npm --version
```

**CentOS/RHEL için:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 2. Git

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

### Önerilen Yazılımlar

#### 3. PM2 (Process Manager)

PM2, Node.js uygulamalarını arka planda çalıştırmak ve otomatik yeniden başlatmak için kullanılır.

```bash
sudo npm install -g pm2
```

#### 4. Nginx (Reverse Proxy)

Nginx, web sunucusu ve reverse proxy olarak kullanılır.

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

---

## 🚀 Kurulum Adımları

### 1. Projeyi Sunucuya Yükleme

**Git ile klonlama (Önerilen):**
```bash
cd /var/www  # veya istediğiniz dizin
git clone <repository-url> RadioApex
cd RadioApex
```

**Manuel yükleme:**
- Tüm proje dosyalarını sunucuya yükleyin
- `node_modules/` klasörünü yüklemeyin (sunucuda oluşturulacak)
- `.next/` klasörünü yüklemeyin (build ile oluşturulacak)

### 2. Bağımlılıkları Yükleme

```bash
cd /var/www/RadioApex  # veya proje dizininiz
npm install
```

### 3. Environment Variables Oluşturma

`.env.local` dosyası oluşturun:

```bash
nano .env.local
```

Aşağıdaki değişkenleri ekleyin:

```env
# Firebase Yapılandırması
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Ortam Değişkeni
NODE_ENV=production

# Port (Opsiyonel - varsayılan 3000)
PORT=3000
```

**Güvenlik Notu:** `.env.local` dosyasını Git'e commit etmeyin!

### 4. Production Build Oluşturma

```bash
npm run build
```

Bu komut `.next/` klasörünü oluşturur ve uygulamayı production için optimize eder.

### 5. Uygulamayı Başlatma

**PM2 ile (Önerilen):**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Manuel olarak:**
```bash
npm start
```

---

## ⚙️ Yapılandırma

### PM2 Ecosystem Dosyası

Proje kök dizininde `ecosystem.config.js` dosyası bulunur:

```javascript
module.exports = {
  apps: [
    {
      name: 'radioapex',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

**PM2 Komutları:**
```bash
pm2 list                    # Çalışan uygulamaları listele
pm2 logs radioapex          # Logları görüntüle
pm2 restart radioapex       # Uygulamayı yeniden başlat
pm2 stop radioapex          # Uygulamayı durdur
pm2 delete radioapex        # Uygulamayı sil
pm2 monit                   # Canlı izleme
```

---

## 🔧 Yaygın Hatalar ve Çözümleri

### ❌ Hata: "Uygulamayı Başlatma Dosyası app.js ⚠️ Dosya yok"

**Sorun:** Sistem `app.js` dosyasını arıyor, ancak Next.js projelerinde bu dosya yoktur.

**Çözüm:**

1. **PM2 kullanıyorsanız:**
   ```bash
   # Yanlış:
   pm2 start app.js
   
   # Doğru:
   pm2 start ecosystem.config.js
   # veya
   pm2 start npm --name "radioapex" -- start
   ```

2. **Hosting paneli kullanıyorsanız (cPanel, Plesk, vb.):**
   - **Başlangıç dosyası:** Boş bırakın veya `package.json` yazın
   - **Başlangıç komutu:** `npm start` veya `next start`
   - **Çalışma dizini:** Proje kök dizini (package.json'ın olduğu yer)
   - **Node.js versiyonu:** 18 veya üzeri seçin

3. **Manuel çalıştırma:**
   ```bash
   npm start
   ```

### ❌ Hata: "Cannot find module"

**Sorun:** Bağımlılıklar yüklenmemiş.

**Çözüm:**
```bash
npm install
```

### ❌ Hata: "Port 3000 already in use"

**Sorun:** Port 3000 zaten kullanılıyor.

**Çözüm:**
```bash
# Farklı port kullanın
PORT=3001 npm start

# Veya çalışan process'i bulun ve durdurun
lsof -i :3000
kill -9 <PID>
```

### ❌ Hata: "Firebase config is missing"

**Sorun:** Environment variables eksik veya yanlış.

**Çözüm:**
1. `.env.local` dosyasının var olduğundan emin olun
2. Tüm Firebase değişkenlerinin doğru olduğunu kontrol edin
3. PM2 kullanıyorsanız, environment variables'ı ecosystem.config.js'e ekleyin

### ❌ Hata: "Build failed"

**Sorun:** Build sırasında hata oluşuyor.

**Çözüm:**
```bash
# Node modules'ü temizleyip yeniden yükleyin
rm -rf node_modules .next
npm install
npm run build
```

---

## 🌐 Nginx Yapılandırması

### Nginx Site Yapılandırması

`/etc/nginx/sites-available/radioapex` dosyası oluşturun:

```nginx
server {
    listen 80;
    server_name radioapex.com www.radioapex.com;
    
    # Log dosyaları
    access_log /var/log/nginx/radioapex-access.log;
    error_log /var/log/nginx/radioapex-error.log;
    
    # Proxy ayarları
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static dosyalar için cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### Nginx'i Aktif Etme

```bash
# Sembolik link oluştur
sudo ln -s /etc/nginx/sites-available/radioapex /etc/nginx/sites-enabled/

# Yapılandırmayı test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

### SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt-get install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d radioapex.com -d www.radioapex.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

---

## 🔥 Firewall Ayarları

```bash
# UFW kullanıyorsanız
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3000/tcp    # Next.js (sadece Nginx kullanmıyorsanız)
sudo ufw enable
```

**Not:** Eğer Nginx kullanıyorsanız, port 3000'i dışarıdan açmanıza gerek yoktur. Sadece 80 ve 443 portlarını açın.

---

## 🔄 Güncelleme İşlemi

Projeyi güncellemek için:

```bash
cd /var/www/RadioApex  # veya proje dizininiz

# Değişiklikleri çek
git pull

# Yeni bağımlılıkları yükle
npm install

# Yeni build oluştur
npm run build

# PM2 ile yeniden başlat
pm2 restart radioapex

# Logları kontrol et
pm2 logs radioapex --lines 50
```

---

## 📁 Proje Yapısı

Sunucuda bulunması gereken dosya ve klasörler:

```
RadioApex/
├── app/                    # Next.js app directory (zorunlu)
├── components/             # React bileşenleri (zorunlu)
├── lib/                    # Utility fonksiyonları (zorunlu)
├── public/                 # Static dosyalar (zorunlu)
├── package.json            # Bağımlılıklar (zorunlu)
├── package-lock.json       # Bağımlılık versiyonları (zorunlu)
├── next.config.mjs         # Next.js yapılandırması (zorunlu)
├── tsconfig.json           # TypeScript yapılandırması (zorunlu)
├── tailwind.config.js      # Tailwind CSS yapılandırması (zorunlu)
├── postcss.config.js       # PostCSS yapılandırması (zorunlu)
├── ecosystem.config.js     # PM2 yapılandırması (opsiyonel)
└── .env.local              # Environment variables (sunucuda oluşturulacak)
```

**Sunucuda oluşturulacaklar:**
- `node_modules/` - `npm install` ile
- `.next/` - `npm run build` ile

---

## 🔍 Sistem Durumu Kontrolü

### Uygulama Durumu

```bash
# PM2 durumu
pm2 status

# Next.js process kontrolü
ps aux | grep node

# Port kontrolü
netstat -tulpn | grep 3000
# veya
lsof -i :3000
```

### Log Kontrolü

```bash
# PM2 logları
pm2 logs radioapex

# Nginx logları
sudo tail -f /var/log/nginx/radioapex-access.log
sudo tail -f /var/log/nginx/radioapex-error.log

# Sistem logları
journalctl -u nginx -f
```

### Performans İzleme

```bash
# PM2 monitör
pm2 monit

# Sistem kaynakları
htop
# veya
top
```

---

## 🆘 Destek ve Sorun Giderme

### Kontrol Listesi

Kurulum sonrası kontrol edilmesi gerekenler:

- [ ] Node.js versiyonu 18+ mı? (`node --version`)
- [ ] `npm install` başarıyla tamamlandı mı?
- [ ] `.env.local` dosyası oluşturuldu ve dolduruldu mu?
- [ ] `npm run build` başarıyla tamamlandı mı?
- [ ] PM2 uygulama çalışıyor mu? (`pm2 list`)
- [ ] Port 3000'de uygulama dinleniyor mu? (`lsof -i :3000`)
- [ ] Nginx yapılandırması doğru mu? (`sudo nginx -t`)
- [ ] Firewall ayarları yapıldı mı?
- [ ] Domain DNS ayarları doğru mu?

### Hata Ayıklama

1. **Logları kontrol edin:**
   ```bash
   pm2 logs radioapex --lines 100
   ```

2. **Build hatalarını kontrol edin:**
   ```bash
   npm run build
   ```

3. **Environment variables'ı kontrol edin:**
   ```bash
   cat .env.local
   ```

4. **Port kullanımını kontrol edin:**
   ```bash
   lsof -i :3000
   ```

---

## 📝 Notlar

- Next.js projelerinde `app.js` dosyası **yoktur**. Uygulama `npm start` komutu ile başlatılır.
- Production'da mutlaka `npm run build` çalıştırılmalıdır.
- `.env.local` dosyası asla Git'e commit edilmemelidir.
- PM2 kullanmak, uygulamanın otomatik yeniden başlatılmasını sağlar.
- Nginx kullanmak, SSL ve performans optimizasyonu için önerilir.

---

## 📞 İletişim

Sorun yaşarsanız:
- Logları kontrol edin
- Bu dokümantasyondaki çözümleri deneyin
- GitHub issues'da sorun bildirin

---

**Son Güncelleme:** 2024
**Versiyon:** 1.0



