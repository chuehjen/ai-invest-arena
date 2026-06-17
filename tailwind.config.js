module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', '"Noto Sans SC"', '"PingFang SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', '"IBM Plex Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        primary: '#2563eb',
      }
    }
  },
  plugins: []
};
