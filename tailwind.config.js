/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
		fontFamily: {
			sans: [
				'var(--font-roboto)',
				'Roboto',
				'system-ui',
				'sans-serif'
			],
			antonio: ['var(--font-antonio)', 'Antonio', 'system-ui', 'sans-serif'],
			anton: ['var(--font-anton)', 'Anton', 'system-ui', 'sans-serif'],
			spaceGrotesk: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
			roboto: ['var(--font-roboto)', 'Roboto', 'system-ui', 'sans-serif']
		},
  		colors: {
  			apex: {
  				background: '#050509',
  				accent: '#ef4444',
  				secondary: '#991b1b',
  				muted: '#1f1f2e'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backgroundImage: {
  			'gradient-glow': 'radial-gradient(circle at top left, rgba(239,68,68,0.35), transparent 55%), radial-gradient(circle at top right, rgba(153,27,27,0.25), transparent 50%), radial-gradient(circle at bottom, rgba(255,255,255,0.08), transparent 55%)'
  		},
		keyframes: {
			marquee: {
				from: {
					transform: 'translateX(0%)'
				},
				to: {
					transform: 'translateX(-50%)'
				}
			},
			'scroll-left': {
				'0%': {
					transform: 'translateX(100%)'
				},
				'100%': {
					transform: 'translateX(-100%)'
				}
			},
			'scroll-right': {
				'0%': {
					transform: 'translateX(-100%)'
				},
				'100%': {
					transform: 'translateX(100%)'
				}
			},
			'slow-spin': {
				from: {
					transform: 'rotate(0deg)'
				},
				to: {
					transform: 'rotate(360deg)'
				}
			},
			'pulse-ring': {
				'0%': {
					transform: 'scale(0.95)',
					opacity: 0.5
				},
				'50%': {
					transform: 'scale(1.05)',
					opacity: 0.7
				},
				'100%': {
					transform: 'scale(0.95)',
					opacity: 0.5
				}
			}
		},
		animation: {
			marquee: 'marquee 35s linear infinite',
			'scroll-left': 'scroll-left 60s linear infinite',
			'scroll-right': 'scroll-right 60s linear infinite',
			'slow-spin': 'slow-spin 40s linear infinite',
			'pulse-ring': 'pulse-ring 6s ease-in-out infinite'
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
};
