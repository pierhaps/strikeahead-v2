/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    'glass-card','glass-strong','glass-subtle',
    'glow-tide','glow-sun','glow-strike','glow-cyan','glow-lime',
    'gradient-tide','gradient-sun','gradient-strike',
    'text-gradient-strike',
    'bg-abyss-950','bg-abyss-900','bg-abyss-800','bg-abyss-700',
    'bg-tide-500','bg-tide-400','bg-tide-300',
    'bg-sun-500','bg-sun-400','bg-sun-300',
    'bg-coral-500','bg-foam-100',
    'bg-navy-900','bg-navy-800','bg-navy-700',
    'bg-cyan2','bg-teal2','bg-lime2',
    'text-mist','text-muted2',
    'ring-strike-lime','ring-strike-teal','ring-strike-cyan',
    'shadow-card','shadow-floating',
    'animate-strike-pulse','animate-aurora','animate-breathe','animate-rise-fade',
    'liquid-glass','liquid-glass-heavy','liquid-glass-subtle','liquid-glass-tab',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        overline: '0.08em',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },

        // Brand v3 direct aliases
        navy: {
          900: '#0A1828',
          800: '#0E1E30',
          700: '#16334D',
          600: '#1F4A70',
        },
        mist:   '#E8F0F5',
        muted2: '#6B8AA8',
        cyan2:  '#2DA8FF',
        teal2:  '#0EBDD8',
        lime2:  '#B6F03C',
        strike: {
          lime: '#B6F03C',
          teal: '#2EE0C9',
          cyan: '#2DA8FF',
        },

        // Legacy class names remapped to Brand v3 values so all existing pages inherit new palette
        abyss: {
          950: '#0A1828', // primary surface
          900: '#0E1E30',
          800: '#16334D',
          700: '#1F4A70',
        },
        tide: {
          300: '#7FDCE5',
          400: '#2EE0C9', // strike teal mid
          500: '#0EBDD8', // brand teal
          600: '#2DA8FF', // brand cyan
        },
        sun: {
          300: '#D8F787',
          400: '#C8F460',
          500: '#B6F03C', // brand lime
        },
        coral: {
          400: '#FF8C7A',
          500: '#FF6B5B',
          600: '#E05141',
        },
        foam: {
          50:  '#F2F7FB',
          100: '#E8F0F5', // mist
          200: '#CBDCEA',
        },
      },
      borderRadius: {
        sm:   '8px',
        md:   '16px',
        lg:   '24px',
        xl:   '28px',
        '2xl':'32px',
        pill: '9999px',
      },
      boxShadow: {
        card:       '0 8px 24px rgba(10,24,40,0.40)',
        floating:   '0 16px 40px rgba(10,24,40,0.55)',
        'glow-cyan':'0 0 28px rgba(45,168,255,0.45)',
        'glow-lime':'0 0 28px rgba(182,240,60,0.45)',
        'glow-teal':'0 0 28px rgba(14,189,216,0.40)',
      },
      backgroundImage: {
        'gradient-strike': 'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)',
        'gradient-tide':   'linear-gradient(135deg, #2DA8FF 0%, #0EBDD8 100%)',
        'gradient-sun':    'linear-gradient(135deg, #B6F03C 0%, #2EE0C9 100%)',
        'gradient-navy':   'linear-gradient(180deg, #0A1828 0%, #0E1E30 100%)',
        'aurora-glow':     'radial-gradient(ellipse at top, rgba(45,168,255,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(182,240,60,0.10), transparent 60%)',
      },
      transitionTimingFunction: {
        tide: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'wave-drift': {
          '0%,100%':{ transform:'translateX(0) translateY(0)'},
          '50%':    { transform:'translateX(-12px) translateY(-6px)'},
        },
        'float-up': {
          '0%':  { transform:'translateY(6px)', opacity:'0'},
          '100%':{ transform:'translateY(0)',   opacity:'1'},
        },
        'shimmer': {
          '0%':  { backgroundPosition:'-200% 0'},
          '100%':{ backgroundPosition:'200% 0'},
        },
        'glow-pulse': {
          '0%,100%':{ boxShadow:'0 0 0 rgba(45,168,255,0.0)'},
          '50%':    { boxShadow:'0 0 24px rgba(45,168,255,0.55)'},
        },
        'strike-pulse': {
          '0%,100%':{ transform:'scale(1)',   filter:'drop-shadow(0 0 0 rgba(182,240,60,0))'},
          '50%':    { transform:'scale(1.04)', filter:'drop-shadow(0 0 16px rgba(182,240,60,0.6))'},
        },
        'aurora': {
          '0%':  { transform:'translate3d(-5%, -2%, 0) rotate(0deg)'},
          '50%': { transform:'translate3d( 5%,  2%, 0) rotate(1deg)'},
          '100%':{ transform:'translate3d(-5%, -2%, 0) rotate(0deg)'},
        },
        'breathe': {
          '0%,100%':{ opacity:'0.7', transform:'scale(1)'},
          '50%':    { opacity:'1',   transform:'scale(1.02)'},
        },
        'rise-fade': {
          '0%':  { transform:'translateY(10px)', opacity:'0'},
          '100%':{ transform:'translateY(0)',    opacity:'1'},
        },
        'strike-sheen': {
          '0%':  { backgroundPosition:'-150% 0'},
          '100%':{ backgroundPosition:'250% 0'},
        },
      },
      animation: {
        'wave-drift':   'wave-drift 14s ease-in-out infinite',
        'float-up':     'float-up .5s cubic-bezier(0.2,0.8,0.2,1) both',
        'shimmer':      'shimmer 2.4s linear infinite',
        'glow-pulse':   'glow-pulse 3s ease-in-out infinite',
        'strike-pulse': 'strike-pulse 2.8s ease-in-out infinite',
        'aurora':       'aurora 18s ease-in-out infinite',
        'breathe':      'breathe 4s ease-in-out infinite',
        'rise-fade':    'rise-fade .55s cubic-bezier(0.2,0.8,0.2,1) both',
        'strike-sheen': 'strike-sheen 2.6s linear infinite',
      },
    },
  },
  plugins: [],
};
