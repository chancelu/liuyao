import * as fs from 'fs';
import * as path from 'path';
const text = fs.readFileSync(path.resolve(__dirname, '../liuyaobook/text/六爻习题卷.txt'), 'utf-8');

// Find ALL occurrences of key markers
const markers = ['六爻吉凶答案卷', '六爻吉凶习题卷', '卷五', '六爻象法答案卷', '卷六'];
for (const m of markers) {
  let idx = 0;
  const positions: number[] = [];
  while ((idx = text.indexOf(m, idx)) !== -1) {
    positions.push(idx);
    idx += m.length;
  }
  console.log(`"${m}" found at:`, positions.map(p => `${p} (${JSON.stringify(text.substring(p-5, p+m.length+20).replace(/\r?\n/g, '↵'))})`));
}

// Check the actual answer section start
const answerStart = text.lastIndexOf('六爻吉凶答案卷');
console.log('\nLast 六爻吉凶答案卷 at:', answerStart);
console.log('Context:', JSON.stringify(text.substring(answerStart, answerStart + 300)));

// Check exercise section
const exStart = text.lastIndexOf('卷五·六爻吉凶习题卷');
console.log('\nLast 卷五 section at:', exStart);
if (exStart > 0) {
  console.log('Context:', JSON.stringify(text.substring(exStart, exStart + 200)));
}
