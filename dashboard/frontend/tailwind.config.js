export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',    
        panel: '#1e293b',         
        primary: '#3b82f6',       
        secondary: '#64748b',     
        accent: '#0ea5e9',        
        danger: '#ef4444',        
        warning: '#f59e0b',       
        success: '#10b981',       
        border: '#334155',        
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}