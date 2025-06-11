#!/usr/bin/env node
import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildForVercel() {
  console.log('🔨 Building frontend with Vite...');
  
  try {
    // Build frontend
    await build({
      root: resolve(__dirname),
      build: {
        outDir: 'dist/public',
        emptyOutDir: true
      }
    });
    
    console.log('✅ Frontend build complete');
    console.log('🚀 Ready for Vercel deployment!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildForVercel().catch(error => {
  console.error('❌ Build script failed:', error);
  process.exit(1);
});