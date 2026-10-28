import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Bật JSX và Fast Refresh cho React.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
});
