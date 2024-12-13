/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'underline',
              '&:hover': {
                color: '#7e22ce',
              },
            },
            '[class~="lead"]': {
              color: 'inherit',
            },
            strong: {
              color: 'inherit',
              fontWeight: '700',
            },
            'ul > li::before': {
              backgroundColor: 'currentColor',
            },
            hr: {
              borderColor: 'currentColor',
              opacity: 0.3,
            },
            h1: {
              color: 'inherit',
              fontWeight: '800',
            },
            h2: {
              color: 'inherit',
              fontWeight: '700',
            },
            h3: {
              color: 'inherit',
              fontWeight: '600',
            },
            h4: {
              color: 'inherit',
              fontWeight: '600',
            },
            code: {
              color: 'inherit',
              fontWeight: '500',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              fontSize: '0.925em',
            },
            pre: {
              backgroundColor: 'rgb(31, 41, 55)',
              color: 'rgb(229, 231, 235)',
              fontSize: '0.925em',
            },
            blockquote: {
              color: 'inherit',
              opacity: 0.8,
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 