import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  /* server:{
    proxy:{
      '/url':'https://menrracs-uggbwe54wq-uc.a.run.app/api/v1'
    }
  }, */
  plugins: [react()],
})
