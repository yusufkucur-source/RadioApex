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
