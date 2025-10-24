/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,html}',
  ],
  prefix: 'tw-',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4d6bfe',
          600: '#3b54d0',
        },
        background: '#ffffff',
        card: '#ffffff',
        text: '#111827',
        muted: '#6b7280',
        border: '#e5e7eb',
        secondary: '#f3f4f6',
        danger: '#c53030',
        success: '#2f855a',
        warning: '#d97706',
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'soft-lg': '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
    },
  },
  safelist: [
    // Dynamic grid/column counts that may be constructed in TS
    { pattern: /(tw-grid-cols|tw-col-span)-(1|2|3|4|5|7|8|12)/ },
    // Dynamic typography/background/border scales
    { pattern: /(tw-text|tw-bg|tw-border)-(xs|sm|base|lg|xl|2xl|3xl)/ },
    // Dynamic spacing utilities
    { pattern: /tw-(px|py|p|m|mx|my)-(0|1|2|3|4|6|8|10|12|16|20)/ },
  ],
  plugins: [],
}