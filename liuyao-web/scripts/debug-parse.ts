import * as fs from 'fs';
import * as path from 'path';

const textPath = path.resolve(__dirname, '../liuyaobook/text/六爻习题卷.txt');
console.log('Path:', textPath);
console.log('Exists:', fs.existsSync(textPath));

if (fs.existsSync(textPath)) {
  const text = fs.readFileSync(textPath, 'utf-8');
  console.log('Length:', text.length);
  console.log('Has 卷五:', text.includes('卷五'));
  
  const idx = text.indexOf('辛巳月');
  console.log('辛巳月 at:', idx);
  if (idx > 0) {
    console.log('Context:', JSON.stringify(text.substring(idx - 20, idx + 80)));
  }
  
  // Check first 200 chars
  console.log('First 200:', JSON.stringify(text.substring(0, 200)));
} else {
  // Try listing the directory
  const dir = path.resolve(__dirname, '../liuyaobook/text');
  console.log('Dir exists:', fs.existsSync(dir));
  if (fs.existsSync(dir)) {
    console.log('Files:', fs.readdirSync(dir));
  }
}
