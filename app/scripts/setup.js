const fs = require('fs');
const path = require('path');

console.log('Setting up H5P Viewer directories...');

// Create upload directories
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'h5p');

// Create directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

console.log('Directory setup complete!');

// Check if MySQL Docker container is running
try {
  console.log('Make sure to start your MySQL container with:');
  console.log('docker-compose up -d');
  console.log('\nYou can then run the application with:');
  console.log('npm run dev');
} catch (err) {
  console.error('Error checking Docker status:', err);
}
