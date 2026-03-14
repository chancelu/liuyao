import * as fs from 'fs';
import * as path from 'path';
const text = fs.readFileSync(path.resolve(__dirname, '../liuyaobook/text/六爻习题卷.txt'), 'utf-8');

// Check parentheses type
const idx = text.indexOf('辛巳月');
const sample = text.substring(idx, idx + 100);
for (let i = 0; i < sample.length && i < 60; i++) {
  const c = sample[i];
  if ('（）()'.includes(c)) {
    console.log('pos', i, 'char:', c, 'code:', c.charCodeAt(0).toString(16));
  }
}
console.log('Sample:', JSON.stringify(sample.substring(0, 80)));

// Check answer section
const ansIdx = text.indexOf('六爻吉凶答案卷');
console.log('Answer at:', ansIdx);
if (ansIdx > 0) {
  console.log('Answer:', JSON.stringify(text.substring(ansIdx, ansIdx + 300)));
}

// Test regex on the sample line
const line = '1. 辛巳月丙戌日（午未空），卦主本人摇得雷风恒变巽为风卦，男问女感情能否复合？';
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const re = new RegExp(
  `^(\\d+)\\.\\s*` +
  `([${STEMS}])([${BRANCHES}])月` +
  `([${STEMS}])([${BRANCHES}])日` +
  `（([${BRANCHES}])([${BRANCHES}])空），` +
  `卦主本人摇得(.+?)(?:变(.+?))?卦，` +
  `(.+?)？`
);
console.log('Regex test on hardcoded:', re.test(line));

// Test on actual text
const actualLine = text.substring(idx - 3, text.indexOf('\r\n', idx));
console.log('Actual line:', JSON.stringify(actualLine));
console.log('Regex test on actual:', re.test(actualLine));
