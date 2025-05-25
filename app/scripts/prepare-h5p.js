/**
 * Script to prepare the H5P environment
 * - Creates necessary directories
 * - Updates type declarations for H5P handling
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Step 1: Create required directories
const dirs = [
  path.join(process.cwd(), 'public', 'uploads', 'h5p'),
  path.join(process.cwd(), 'public', 'h5p')
];

console.log('Creating required directories...');
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Step 2: Update AdmZip type declaration file
const typeDir = path.join(process.cwd(), 'src', 'types');
if (!fs.existsSync(typeDir)) {
  fs.mkdirSync(typeDir, { recursive: true });
}

console.log('Installing dependencies...');
const installProcess = exec('npm install adm-zip @types/adm-zip --save', (error) => {
  if (error) {
    console.error('Error installing dependencies:', error);
    return;
  }
  
  console.log('Dependencies installed successfully!');
});

installProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

installProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

console.log('H5P environment preparation completed!');
