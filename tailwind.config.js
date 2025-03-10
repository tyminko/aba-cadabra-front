const baseSize = 3 // rem
const textBlockWidth = 38 // rem
module.exports = {
  important: '#app',
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx'
  ],
  theme: {
    extend: {
      screens: {
        text: '35em'
      },
      colors: {
        'aba-blue': '#0000ff',
        'aba-red': '#860025',
        'aba-blue-dark': '#001776',
        'aba-blue-semi': 'rgba(0,61,255,0.44)',
        shadow: 'rgba(0,0,0,0.2)',
        milk: 'rgba(255,255,255,0.8)',
        gray: {
          100: '#fafafa',
          200: '#e6e6e6',
          300: '#cccccc',
          400: '#b3b3b3',
          500: '#999999',
          600: '#808080',
          700: '#666666',
          800: '#4d4d4d',
          900: '#333333'
        }
      },
      spacing: {
        base: `${baseSize}rem`,
        '1/12base': `${baseSize / 12}rem`,
        '1/8base': `${baseSize / 8}rem`,
        '1/6base': `${baseSize / 6}rem`,
        '1/3base': `${baseSize / 3}rem`,
        '1/2base': `${baseSize / 2}rem`,
        '2/3base': `${baseSize / 3 * 2}rem`,
        '3/4base': `${baseSize * 0.75}rem`,
        '5/6base': `${baseSize / 6 * 5}rem`,
        '3/8base': `${baseSize * 0.375}rem`,
        text: `${textBlockWidth}em`,
        x2: `${baseSize * 2}rem`,
        x3: `${baseSize * 3}rem`
      },
      padding: {
        xs: `${baseSize / 12}rem`,
        sm: `${baseSize / 6}rem`,
        base: `${baseSize / 3}rem`,
        lg: `${baseSize / 2}rem`,
        xl: `${baseSize / 3 * 2}rem`,
        xxl: `${baseSize * 2}rem`
      },
      margin: {
        base: `${baseSize / 3}rem`,
        '-base': `-${baseSize / 3}rem`,
        sm: `${baseSize / 6}rem`,
        xs: `${baseSize / 12}rem`,
        lg: `${baseSize / 2}rem`,
        '-sm': `-${baseSize / 6}rem`,
        xl: `${baseSize / 3 * 2}rem`,
        '-xl': `-${baseSize / 3 * 2}rem`,
        xxl: `${baseSize}rem`
      },
      gap: {
        base: `${baseSize / 3}rem`,
        lg: `${baseSize / 2}rem`
      },
      maxWidth: {
        text: `${textBlockWidth}em`,
        '1/8base': `${baseSize / 8}rem`,
        '5/6base': `${baseSize / 6 * 5}rem`
      },
      minWidth: {
        text: `${textBlockWidth}em`,
        '1/8base': `${baseSize / 8}rem`,
        '5/6base': `${baseSize / 6 * 5}rem`
      },
      minHeight: {
        base: `${baseSize}rem`,
        x2: `${baseSize * 2}rem`
      },
      borderWidth: {
        '1/2base': `${baseSize / 2}rem`,
        xl: `${baseSize / 12}rem`
      },
      borderRadius: {
        '1/2base': `${baseSize * 0.5}rem`,
        '1/3base': `${baseSize / 3}rem`,
        '3/8base': `${baseSize * 0.375}rem`,
        '1/2': '50%'
      },
      boxShadow: {
        soft: '0 2px 60px rgba(0, 0, 0, 0.05)'
      },
      inset: {
        '1/12base': `${baseSize / 12}rem`
      },
      transitionProperty: {
        spacing: 'margin, padding'
      }
    }
  },
  variants: {
    extend: {
      backgroundColor: ['responsive', 'hover', 'focus', 'before'],
      textColor: ['responsive', 'hover', 'focus', 'active']
    }
  },
  plugins: []
}
