#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Starting optimized build for Vercel...');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  console.log('📦 Running Vite build with optimizations...');
  
  // Set environment variables for faster build
  process.env.NODE_ENV = 'production';
  process.env.VITE_BUILD_OPTIMIZE = 'true';
  
  // Run vite build with timeout handling
  execSync('vite build --mode production --logLevel warn', {
    stdio: 'inherit',
    timeout: 120000, // 2 minutes timeout
    env: { ...process.env }
  });
  
  console.log('✅ Build completed successfully!');
  
  // Verify build output
  const distPath = path.resolve('dist/public');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log(`📁 Generated ${files.length} files in dist/public/`);
    console.log('🚀 Ready for Vercel deployment!');
  } else {
    throw new Error('Build output directory not found');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // If build fails due to timeout, try partial build
  console.log('🔄 Attempting recovery build...');
  try {
    execSync('vite build --mode production --minify false', {
      stdio: 'inherit',
      timeout: 60000
    });
    console.log('✅ Recovery build completed!');
  } catch (recoveryError) {
    console.error('❌ Recovery build also failed:', recoveryError.message);
    process.exit(1);
  }
}