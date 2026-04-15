/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
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
        // NOMDAD Ocean Palette
        abyss: {
          950: '#021521',
          900: '#041C2B',
          800: '#072637',
          700: '#0A3244',
          600: '#0E4054',
        },
        tide: {
          500: '#1FA7B8',
          400: '#4DC3D1',
          300: '#7FDCE5',
        },
        reef: {
          700: '#0A4450',
          600: '#0E5D6C',
        },
        sun: {
          500: '#F5C34B',
          400: '#FFD872',
          300: '#FFE38F',
        },
        coral: {
          500: '#FF6B5B',
        },
        foam: '#EAF8FA',
        sand: '#F6ECD6',
        chart: {
          '1': 'hsl(var(--chart-1, 188 78% 42%))',
          '2': 'hsl(var(--chart-2, 44 90% 62%))',
          '3': 'hsl(var(--chart-3, 207 65% 30%))',
          '4': 'hsl(var(--chart-4, 188 60% 55%))',
          '5': 'hsl(var(--chart-5, 5 100% 68%))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background, 215 86% 7%))',
          foreground: 'hsl(var(--sidebar-foreground, 186 67% 95%))',
          primary: 'hsl(var(--sidebar-primary, 188 78% 42%))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground, 215 86% 7%))',
          accent: 'hsl(var(--sidebar-accent, 207 55% 15%))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground, 186 67% 95%))',
          border: 'hsl(var(--sidebar-border, 188 50% 25%))',
          ring: 'hsl(var(--sidebar-ring, 188 78% 42%))',
        }
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'wave-drift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'float-up': {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-100vh) translateX(20px)', opacity: '0' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(31,167,184,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(31,167,184,0.6)' }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'wave-drift-slow': 'wave-drift 24s linear infinite',
        'wave-drift-slower': 'wave-drift 32s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'text-gradient-tide', 'text-gradient-sun', 'glass-card', 'glass-strong',
    'glow-tide', 'glow-sun', 'gradient-tide', 'gradient-sun',
    'bg-abyss-950', 'bg-abyss-900', 'bg-abyss-800', 'bg-abyss-700',
    'bg-tide-500', 'bg-tide-400', 'bg-tide-300',
    'bg-sun-500', 'bg-sun-400', 'bg-sun-300',
    'text-tide-500', 'text-tide-400', 'text-tide-300',
    'text-sun-500', 'text-sun-400', 'text-sun-300',
    'border-tide-500', 'border-tide-300',
  ]
}
