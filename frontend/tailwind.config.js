/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-research': 'linear-gradient(180deg, #fafbfc 0%, #f8fafc 100%)',
        'gradient-data': 'linear-gradient(135deg, hsl(var(--research-blue)) 0%, hsl(var(--data-green)) 100%)',
        'gradient-metric': 'linear-gradient(90deg, hsl(var(--research-blue)) 0%, hsl(var(--primary)) 100%)',
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'gradient-success': 'linear-gradient(135deg, hsl(var(--data-green)) 0%, hsl(142 71% 35%) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'data-load': 'dataLoad 1.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        dataLoad: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width, 100%)' },
        },
      },
      boxShadow: {
        'research': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'data': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'metric': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'glow': '0 4px 14px rgba(59, 130, 246, 0.12), 0 2px 4px rgba(59, 130, 246, 0.08)',
        'glow-lg': '0 6px 20px rgba(59, 130, 246, 0.16), 0 4px 8px rgba(59, 130, 246, 0.12)',
      },
    },
  },
  plugins: [],
}
