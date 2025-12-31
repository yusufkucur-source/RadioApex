# RadioApex Website

A modern, interactive radio station website built with Next.js, featuring real-time audio streaming, animated graphics, and a sleek user interface.

## Description

RadioApex is an experimental space broadcasting electronic, ambient, avant-garde, and boundary-pushing sounds 24/7. This website provides an immersive experience with:

- **Real-time Audio Streaming**: Live radio player with now-playing information
- **Interactive Animations**: Parallax scrolling effects and animated SVG graphics
- **Modern UI/UX**: Built with Tailwind CSS and Framer Motion for smooth animations
- **Responsive Design**: Optimized for all device sizes
- **Firebase Integration**: Real-time data management for now-playing information
- **Admin Panel**: Content management system for radio station operations

## Features

- 🎵 Live radio streaming with custom audio player
- 🎨 Animated turntable graphics and visual effects
- 📱 Fully responsive design
- ⚡ Real-time now-playing information
- 🎛️ Admin panel for content management
- 🔥 Firebase backend integration
- 🎭 Smooth scroll animations and parallax effects

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Authentication)
- **Audio**: Custom audio player with Web Audio API
- **UI Components**: Radix UI, Lucide React icons
- **Development**: ESLint, Prettier, PostCSS

## How to Run

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for backend features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd RadioApex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Server Deployment (Sunucu Kurulumu)

### Gereksinimler (Sunucuda Kurulu Olması Gerekenler)

1. **Node.js 18+ ve npm**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Versiyon kontrolü
   node --version
   npm --version
   ```

2. **Git**
   ```bash
   sudo apt-get update
   sudo apt-get install git
   ```

3. **PM2 (Process Manager - Önerilir)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Nginx (Reverse Proxy - Önerilir)**
   ```bash
   sudo apt-get install nginx
   ```

### Sunucuya Yüklenecek Dosya ve Klasörler

**Önerilen Yöntem: Git ile Klonlama** (En kolay ve güvenli)
- Git kullanarak tüm projeyi klonlayın (aşağıdaki "Kurulum Adımları" bölümüne bakın)
- Bu yöntem otomatik olarak tüm gerekli dosyaları getirir

**Manuel Yükleme (Git kullanmıyorsanız):**

Sunucuya yüklemeniz gereken dosya ve klasörler:

**Zorunlu Dosyalar:**
```
RadioApex/
├── app/                    # Tüm kaynak kodlar (zorunlu)
├── components/             # React bileşenleri (zorunlu)
├── lib/                    # Utility fonksiyonları (zorunlu)
├── public/                 # Static dosyalar (resimler, favicon, vb.) (zorunlu)
├── package.json            # Bağımlılıklar listesi (zorunlu)
├── package-lock.json       # Bağımlılık versiyonları (zorunlu)
├── next.config.mjs         # Next.js yapılandırması (zorunlu)
├── tsconfig.json           # TypeScript yapılandırması (zorunlu)
├── tailwind.config.js      # Tailwind CSS yapılandırması (zorunlu)
├── postcss.config.js       # PostCSS yapılandırması (zorunlu)
├── next-env.d.ts           # Next.js type tanımları (zorunlu)
└── .eslintrc.json          # ESLint yapılandırması (opsiyonel)
```

**Yüklenmeyecek Dosyalar:**
- `node_modules/` - Sunucuda `npm install` ile oluşturulacak
- `.next/` - Sunucuda `npm run build` ile oluşturulacak
- `.env.local` - Sunucuda manuel oluşturulacak (güvenlik için)
- `.git/` - Git klasörü (gerekli değil)
- `README.md` - Dokümantasyon (opsiyonel)

**Özet:**
1. Tüm kaynak kod klasörlerini yükleyin (`app`, `components`, `lib`)
2. `public` klasörünü yükleyin
3. Yapılandırma dosyalarını yükleyin (`package.json`, `next.config.mjs`, `tsconfig.json`, vb.)
4. Sunucuda `npm install` çalıştırın
5. Sunucuda `.env.local` dosyası oluşturun
6. Sunucuda `npm run build` çalıştırın

### Kurulum Adımları

1. **Projeyi klonlayın:**
   ```bash
   cd /var/www  # veya istediğiniz dizin
   git clone <repository-url> RadioApex
   cd RadioApex
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment variables oluşturun:**
   ```bash
   nano .env.local
   ```
   
   Aşağıdaki değişkenleri ekleyin:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NODE_ENV=production
   ```

4. **Production build oluşturun:**
   ```bash
   npm run build
   ```

5. **PM2 ile çalıştırın:**
   ```bash
   pm2 start npm --name "radioapex" -- start
   pm2 save
   pm2 startup
   ```

6. **Nginx yapılandırması (Opsiyonel):**
   
   `/etc/nginx/sites-available/radioapex` dosyası oluşturun:
   ```nginx
   server {
       listen 80;
       server_name radioapex.com www.radioapex.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Sembolik link oluşturun ve Nginx'i yeniden başlatın:
   ```bash
   sudo ln -s /etc/nginx/sites-available/radioapex /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Firewall ayarları:**
   ```bash
   # Port 3000'i açın (eğer Nginx kullanmıyorsanız)
   sudo ufw allow 3000/tcp
   
   # HTTP ve HTTPS portlarını açın
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Güncelleme İşlemi

Projeyi güncellemek için:
```bash
cd /var/www/RadioApex  # veya proje dizininiz
git pull
npm install
npm run build
pm2 restart radioapex
```

### PM2 Komutları

- `pm2 list` - Çalışan uygulamaları listele
- `pm2 logs radioapex` - Logları görüntüle
- `pm2 restart radioapex` - Uygulamayı yeniden başlat
- `pm2 stop radioapex` - Uygulamayı durdur
- `pm2 delete radioapex` - Uygulamayı sil

## How to Test

### Running Tests

The project uses Jest and React Testing Library for testing. To run tests:

```bash
npm test
```

### Running Linting

Check code quality and formatting:

```bash
npm run lint
```

### Code Formatting

Format code with Prettier:

```bash
npm run format
```

## Project Structure

```
RadioApex/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   └── page.tsx           # Main homepage
├── components/            # React components
│   ├── admin/             # Admin panel components
│   ├── audio/             # Audio player components
│   ├── graphics/          # SVG and animation components
│   ├── layout/            # Layout components
│   ├── navigation/        # Navigation components
│   ├── now-playing/       # Now playing components
│   ├── sections/          # Page sections
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   └── firebase/          # Firebase configuration and hooks
├── public/                # Static assets
│   └── images/            # Images and SVG files
└── styles/                # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary to RadioApex.

## Contact

- Website: [RadioApex](https://radioapex.com)
- Instagram: [@radioapex](https://instagram.com/radioapex)
- Twitter: [@radioapex](https://twitter.com/radioapex)
- SoundCloud: [RadioApex](https://soundcloud.com/radioapex)
