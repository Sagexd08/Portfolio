/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        chrome: 'var(--chrome)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        hairline: 'var(--hairline)',
        accent: 'var(--accent)',
        ok: 'var(--ok)',
      },
    },
  },
  plugins: [],
};
