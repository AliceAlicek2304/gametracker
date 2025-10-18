const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllFiles(srcDir);
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if uses apiFetch but doesn't import it
  if (content.includes('apiFetch(') && !content.includes('apiHelper')) {
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      // Calculate relative path depth
      const depth = file.split(path.sep).length - srcDir.split(path.sep).length - 1;
      const relativePath = '../'.repeat(depth) + 'utils/apiHelper';
      lines.splice(lastImportIndex + 1, 0, `import { apiFetch } from '${relativePath}';`);
      content = lines.join('\n');
      
      fs.writeFileSync(file, content, 'utf8');
      console.log('✓', path.relative(srcDir, file));
      count++;
    }
  }
});

console.log(`\n✅ Added imports to ${count} files`);
