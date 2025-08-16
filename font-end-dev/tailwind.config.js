module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        Prompt: ["Prompt", 'serif'],
      },
      colors: {
        primary: '#154961',
        secondary: '#ebf7fd',
        background: '#FFFFFF',
        surface: '#E0E0E0',
        text: '#111111',
        subtext: '#4B4B4B',
        hightlight: '#154961',
        border: '#E0E0E0',
        button: '#227D8D',
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545',
      },
    },
  },
  plugins: [],
}
