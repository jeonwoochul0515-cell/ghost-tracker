import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        'bg-2': '#131312',
        'bg-3': '#1c1b19',
        ink: '#f5f1e8',
        'ink-dim': '#a8a29a',
        'ink-faint': '#5a564f',
        line: '#2a2825',
        accent: '#d4ad3c',
        danger: '#c14545',
        warning: '#d4843c',
        safe: '#5a8a5a',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        'serif-kr': ['"Noto Serif KR"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
