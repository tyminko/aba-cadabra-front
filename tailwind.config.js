const baseSize = 3 // rem
module.exports = {
  theme: {
    extend: {
      colors: {
        'aba-blue': '#0000ff',
        'aba-blue-semi': 'rgba(0,61,255,0.44)',
        'shadow': 'rgba(0,0,0,0.2)',
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
        'base': `${baseSize}rem`,
        '1/6base': `${baseSize / 6}rem`,
        '1/3base': `${baseSize / 3}rem`,
        '1/2base': `${baseSize / 2}rem`,
        '2/3base': `${baseSize / 3 * 2}rem`,
        '3/4base': `${baseSize * 0.75}rem`,
        'x2': `${baseSize * 2}rem`,
        'x3': `${baseSize * 3}rem`
      },
      padding: {
        'base': `${baseSize / 3}rem`,
        'sm': `${baseSize / 6}rem`,
        'xl': `${baseSize / 3 * 2}rem`
      },
      margin: {
        'base': `${baseSize / 3}rem`,
        'sm': `${baseSize / 6}rem`,
        'xl': `${baseSize / 3 * 2}rem`
      },
      maxWidth: {
        'text': '35em'
      },
      minHeight: {
        'base': `${baseSize}rem`,
        'x2': `${baseSize * 2}rem`
      },
      borderWidth: {
        'xl': `${baseSize / 12}rem`
      }
    }
  },
  variants: {},
  plugins: []
}
