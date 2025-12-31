# RadioApex Plesk Panel Kurulum Rehberi

Bu rehber, RadioApex web sitesini Plesk panelinde kurmak için adım adım talimatlar içerir.

## 📋 İçindekiler

1. [Plesk'te Node.js Kurulumu](#pleskte-nodejs-kurulumu)
2. [Domain ve Uygulama Oluşturma](#domain-ve-uygulama-oluşturma)
3. [Dosya Yükleme](#dosya-yükleme)
4. [Environment Variables Ayarlama](#environment-variables-ayarlama)
5. [Build ve Başlatma](#build-ve-başlatma)
6. [Yaygın Hatalar ve Çözümleri](#yaygın-hatalar-ve-çözümleri)
7. [Güncelleme İşlemi](#güncelleme-işlemi)

---

## 🖥️ Plesk'te Node.js Kurulumu

### Adım 1: Node.js Versiyonunu Kontrol Etme

1. Plesk paneline giriş yapın
2. **Tools & Settings** (Araçlar ve Ayarlar) menüsüne gidin
3. **Node.js** bölümünü açın
4. Node.js 18 veya üzeri bir versiyonun kurulu olduğunu kontrol edin

**Eğer Node.js kurulu değilse:**
- Plesk'in **Node.js** eklentisini kurun
- Veya sunucu yöneticisinden Node.js 18+ kurulumu isteyin

### Adım 2: Domain için Node.js Etkinleştirme

1. **Domains** (Alan Adları) menüsüne gidin
2. Domain'inizi seçin
3. **Node.js** sekmesine tıklayın
4. **Enable Node.js** (Node.js'i Etkinleştir) seçeneğini açın
5. **Node.js version** (Node.js versiyonu) olarak **18.x** veya üzeri seçin
6. **Document root** (Döküman kökü) olarak proje klasörünüzü seçin (örn: `httpdocs`)
7. **Application root** (Uygulama kökü) olarak aynı klasörü seçin
8. **Application startup file** (Uygulama başlangıç dosyası) alanına `server.js` yazın
9. **Application mode** (Uygulama modu) olarak **production** seçin
10. **Save** (Kaydet) butonuna tıklayın

---

## 🌐 Domain ve Uygulama Oluşturma

### Adım 1: Domain Ekleme (Eğer yoksa)

1. **Domains** menüsüne gidin
2. **Add Domain** (Domain Ekle) butonuna tıklayın
3. Domain adınızı girin (örn: `radioapex.com`)
4. Gerekli ayarları yapın ve kaydedin

### Adım 2: Node.js Uygulaması Oluşturma

1. Domain'inizi seçin
2. **Node.js** sekmesine gidin
3. **Enable Node.js** seçeneğini açın
4. Aşağıdaki ayarları yapın:

```
Node.js version: 18.x (veya üzeri)
Document root: httpdocs
Application root: httpdocs
Application startup file: server.js
Application mode: production
Application URL: / (varsayılan)
```

5. **Save** butonuna tıklayin

---

## 📁 Dosya Yükleme

### Yöntem 1: Plesk File Manager ile

1. Domain'inizi seçin
2. **Files** (Dosyalar) menüsüne gidin
3. `httpdocs` klasörüne girin
4. Tüm proje dosyalarını yükleyin:

**Yüklenecek Dosya ve Klasörler:**
```
✅ app/                    (tüm içeriği ile)
✅ components/             (tüm içeriği ile)
✅ lib/                    (tüm içeriği ile)
✅ public/                 (tüm içeriği ile)
✅ package.json
✅ package-lock.json
✅ next.config.mjs
✅ tsconfig.json
✅ tailwind.config.js
✅ postcss.config.js
✅ next-env.d.ts
✅ server.js                (Plesk için zorunlu)
✅ ecosystem.config.js     (opsiyonel)
```

**Yüklenmeyecek Dosyalar:**
```
❌ node_modules/           (sunucuda oluşturulacak)
❌ .next/                  (build ile oluşturulacak)
❌ .env.local              (sunucuda oluşturulacak)
❌ .git/                   (gerekli değil)
```

### Yöntem 2: FTP ile

1. FTP bilgilerinizi alın (Plesk'te **FTP Accounts** bölümünden)
2. FTP istemcisi ile bağlanın
3. `httpdocs` klasörüne tüm dosyaları yükleyin

### Yöntem 3: Git ile (Önerilen)

1. Plesk'te **Git** eklentisini kurun (eğer yoksa)
2. Domain'inizi seçin
3. **Git** sekmesine gidin
4. Repository URL'inizi girin
5. **Deploy** butonuna tıklayın
6. Dosyalar otomatik olarak `httpdocs` klasörüne çekilecek

---

## ⚙️ Environment Variables Ayarlama

### Plesk'te Environment Variables Ekleme

1. Domain'inizi seçin
2. **Node.js** sekmesine gidin
3. **Environment variables** (Ortam değişkenleri) bölümünü bulun
4. Aşağıdaki değişkenleri ekleyin:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NODE_ENV=production
PORT=3000
```

**Her değişken için:**
- **Name** (İsim) alanına değişken adını yazın (örn: `NEXT_PUBLIC_FIREBASE_API_KEY`)
- **Value** (Değer) alanına değeri yazın
- **Add** butonuna tıklayın

### Alternatif: .env.local Dosyası Oluşturma

Eğer Plesk'te environment variables ekleyemiyorsanız:

1. **Files** menüsüne gidin
2. `httpdocs` klasörüne girin
3. Yeni dosya oluşturun: `.env.local`
4. İçine yukarıdaki environment variables'ı ekleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NODE_ENV=production
PORT=3000
```

---

## 🚀 Build ve Başlatma

### Adım 1: SSH ile Bağlanma

1. Plesk'te **SSH Access** (SSH Erişimi) bölümüne gidin
2. SSH erişimini etkinleştirin (eğer kapalıysa)
3. SSH bilgilerinizi alın
4. Terminal/SSH istemcisi ile sunucuya bağlanın

### Adım 2: Proje Dizinine Gitme

```bash
cd /var/www/vhosts/your-domain.com/httpdocs
# veya
cd ~/httpdocs
# veya Plesk'in gösterdiği tam yol
```

### Adım 3: Bağımlılıkları Yükleme

```bash
npm install
```

Bu işlem birkaç dakika sürebilir.

### Adım 4: Production Build Oluşturma

```bash
npm run build
```

Build işlemi tamamlandığında `.next/` klasörü oluşturulacaktır.

### Adım 5: Uygulamayı Başlatma

**Plesk Panel Üzerinden:**

1. Domain'inizi seçin
2. **Node.js** sekmesine gidin
3. **Application startup file** alanına `server.js` yazıldığından emin olun
4. **Application mode** olarak **production** seçili olduğundan emin olun
5. **Save** butonuna tıklayın
6. **Restart App** (Uygulamayı Yeniden Başlat) butonuna tıklayın

**SSH Üzerinden (Alternatif):**

```bash
npm start
```

---

## 🔧 Yaygın Hatalar ve Çözümleri

### ❌ Hata: "Uygulamayı Başlatma Dosyası app.js ⚠️ Dosya yok"

**Sorun:** Plesk `app.js` dosyasını arıyor, ancak Next.js projelerinde bu dosya yoktur.

**Çözüm:**

1. Proje kök dizininde `server.js` dosyasının olduğundan emin olun (bu dosya projeye eklenmiştir)
2. **Node.js** sekmesine gidin
3. **Application startup file** (Uygulama başlangıç dosyası) alanına `server.js` yazın
4. **Save** butonuna tıklayın
5. **Restart App** butonuna tıklayın

**Önemli:** `server.js` dosyası Next.js'i `npm start` komutu ile başlatır. Bu dosya projeye eklenmiştir ve sunucuya yüklenmelidir.

### ❌ Hata: "Cannot find module"

**Sorun:** Bağımlılıklar yüklenmemiş.

**Çözüm:**

1. SSH ile bağlanın
2. Proje dizinine gidin
3. Çalıştırın:
   ```bash
   npm install
   ```

### ❌ Hata: "Build failed"

**Sorun:** Build sırasında hata oluşuyor.

**Çözüm:**

1. SSH ile bağlanın
2. Proje dizinine gidin
3. Temizleyip yeniden yükleyin:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   ```

### ❌ Hata: "Port 3000 already in use"

**Sorun:** Port zaten kullanılıyor.

**Çözüm:**

1. Plesk'te **Node.js** sekmesine gidin
2. **Environment variables** bölümüne gidin
3. `PORT` değişkenini farklı bir değere ayarlayın (örn: `3001`)
4. **Save** ve **Restart App** yapın

### ❌ Hata: "Firebase config is missing"

**Sorun:** Environment variables eksik.

**Çözüm:**

1. Plesk'te **Node.js** sekmesine gidin
2. **Environment variables** bölümüne gidin
3. Tüm Firebase değişkenlerinin eklendiğinden emin olun
4. Değerlerin doğru olduğunu kontrol edin
5. **Save** ve **Restart App** yapın

### ❌ Hata: "Application failed to start"

**Sorun:** Uygulama başlatılamıyor.

**Çözüm:**

1. **Node.js** sekmesinde **Logs** (Günlükler) bölümüne bakın
2. Hata mesajlarını kontrol edin
3. SSH ile bağlanıp manuel olarak test edin:
   ```bash
   cd /var/www/vhosts/your-domain.com/httpdocs
   npm start
   ```

### ❌ Hata: Phusion Passenger "Something went wrong" Hatası

**Sorun:** Plesk'te Phusion Passenger hatası alıyorsunuz. Bu genellikle `server.js` dosyasının Passenger ile uyumlu olmamasından kaynaklanır.

**Çözüm:**

1. **Güncel `server.js` dosyasını yükleyin:**
   - Projede bulunan `server.js` dosyasının en güncel versiyonunu sunucuya yükleyin
   - Bu dosya Passenger ile uyumlu olarak güncellenmiştir

2. **Build kontrolü:**
   ```bash
   cd /var/www/vhosts/your-domain.com/httpdocs
   npm install
   npm run build
   ```

3. **Node.js modüllerinin yüklü olduğundan emin olun:**
   ```bash
   ls -la node_modules/next
   ```
   Eğer yoksa:
   ```bash
   npm install
   ```

4. **Environment variables kontrolü:**
   - Plesk'te **Node.js > Environment variables** bölümünden tüm değişkenlerin eklendiğinden emin olun
   - Özellikle `NODE_ENV=production` olmalı

5. **Plesk'te yeniden başlatın:**
   - **Node.js** sekmesine gidin
   - **Restart App** butonuna tıklayın

6. **Logları kontrol edin:**
   - Plesk'te **Node.js > Logs** bölümünden hata mesajlarını okuyun
   - SSH ile de kontrol edebilirsiniz:
     ```bash
     tail -f /var/www/vhosts/your-domain.com/logs/error_log
     ```

**Önemli:** `server.js` dosyası artık Passenger ile uyumlu olarak güncellenmiştir. Bu dosya Next.js'i doğrudan HTTP server olarak başlatır ve Passenger'ın beklediği formatta export eder.

---

## 📝 Plesk Node.js Ayarları Özeti

**Doğru Yapılandırma:**

```
✅ Node.js version: 18.x (veya üzeri)
✅ Document root: httpdocs
✅ Application root: httpdocs
✅ Application startup file: server.js
✅ Application mode: production
✅ Application URL: /
```

**Yanlış Yapılandırma:**

```
❌ Application startup file: app.js  (YANLIŞ!)
❌ Application startup file: (boş)  (Plesk boş bırakmaya izin vermiyorsa)
❌ Application mode: development     (Production'da yanlış)
```

---

## 🔄 Güncelleme İşlemi

### Yöntem 1: Git ile (Önerilen)

1. Plesk'te **Git** sekmesine gidin
2. **Pull** butonuna tıklayın
3. SSH ile bağlanın:
   ```bash
   cd /var/www/vhosts/your-domain.com/httpdocs
   npm install
   npm run build
   ```
4. Plesk'te **Node.js** sekmesine gidin
5. **Restart App** butonuna tıklayın

### Yöntem 2: Manuel Dosya Yükleme

1. Yeni dosyaları **Files** menüsünden yükleyin
2. SSH ile bağlanın:
   ```bash
   cd /var/www/vhosts/your-domain.com/httpdocs
   npm install
   npm run build
   ```
3. Plesk'te **Node.js** sekmesine gidin
4. **Restart App** butonuna tıklayın

---

## 🔍 Log Kontrolü

### Plesk Panel Üzerinden

1. Domain'inizi seçin
2. **Node.js** sekmesine gidin
3. **Logs** (Günlükler) bölümüne bakın
4. Hata ve bilgi mesajlarını kontrol edin

### SSH Üzerinden

```bash
# Plesk log dizini
tail -f /var/www/vhosts/your-domain.com/logs/error_log
tail -f /var/www/vhosts/your-domain.com/logs/access_log

# Node.js logları (eğer PM2 kullanıyorsanız)
pm2 logs
```

---

## ✅ Kurulum Kontrol Listesi

Kurulum sonrası kontrol edilmesi gerekenler:

- [ ] Node.js 18+ kurulu mu? (Plesk'te kontrol edin)
- [ ] Domain için Node.js etkinleştirildi mi?
- [ ] Tüm dosyalar `httpdocs` klasörüne yüklendi mi?
- [ ] `npm install` başarıyla tamamlandı mı?
- [ ] `npm run build` başarıyla tamamlandı mı?
- [ ] Environment variables eklendi mi?
- [ ] `server.js` dosyası yüklendi mi?
- [ ] Application startup file `server.js` olarak ayarlandı mı?
- [ ] Application mode **production** mu?
- [ ] Uygulama başlatıldı mı? (Restart App yapıldı mı?)
- [ ] Site çalışıyor mu? (Tarayıcıda test edin)

---

## 🆘 Sorun Giderme İpuçları

### Uygulama Başlamıyorsa

1. **Logları kontrol edin:**
   - Plesk'te **Node.js > Logs** bölümüne bakın
   - SSH ile log dosyalarını kontrol edin

2. **Manuel test edin:**
   ```bash
   cd /var/www/vhosts/your-domain.com/httpdocs
   npm start
   ```

3. **Port kontrolü:**
   - Plesk'te farklı bir port deneyin
   - Environment variables'da `PORT=3001` gibi farklı bir değer ayarlayın

4. **Build kontrolü:**
   ```bash
   npm run build
   ```
   Build hatalarını kontrol edin

### Site Yüklenmiyorsa

1. **DNS kontrolü:** Domain'in doğru sunucuya yönlendirildiğinden emin olun
2. **SSL kontrolü:** SSL sertifikası kurulu mu kontrol edin
3. **Firewall:** Port 3000 (veya kullandığınız port) açık mı kontrol edin
4. **Plesk proxy ayarları:** Plesk'in reverse proxy ayarlarını kontrol edin

---

## 📞 Destek

Sorun yaşarsanız:

1. Plesk **Node.js > Logs** bölümündeki hata mesajlarını kontrol edin
2. SSH ile manuel test yapın
3. Bu dokümantasyondaki çözümleri deneyin
4. Sunucu yöneticisi ile iletişime geçin

---

## 📝 Önemli Notlar

- **Next.js projelerinde `app.js` dosyası YOKTUR!** Application startup file alanına `server.js` yazın.
- `server.js` dosyası projeye eklenmiştir ve sunucuya yüklenmelidir.
- Production'da mutlaka `npm run build` çalıştırılmalıdır.
- Environment variables'ı Plesk panelinden eklemek daha güvenlidir.
- Her güncellemeden sonra `npm install`, `npm run build` ve **Restart App** yapın.
- Plesk'in Node.js eklentisi güncel olmalıdır.

---

**Son Güncelleme:** 2024  
**Versiyon:** 1.0  
**Platform:** Plesk Panel

