import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');
const ZH_RE = /[\u4e00-\u9fff]/;

// Files that are allowed to contain Chinese (engine, data, API routes, etc.)
const ALLOWED_CHINESE = new Set([
  'lib/analysis', 'lib/liuyao', 'lib/mock-divination.ts', 'lib/repository',
  'lib/types.ts', 'messages/', 'i18n.tsx', 'glossary', 'liuyaobook',
  'scripts', 'constants.ts', 'api/', '__tests__',
  // Intentionally Chinese content:
  'ui/rotating-quote.tsx',  // I Ching original quotes are always Chinese
  'app/layout.tsx',         // Server component metadata (SEO)
]);

// Specific lines that are allowed to contain Chinese (decorative/data)
const ALLOWED_LINES: Record<string, Set<number>> = {
  // Bagua trigram names in SVG (decorative), Chinese numerals (壹贰叁), CTA design
  'app/page.tsx': new Set([83, 86, 87, 88, 89, 90, 91, 92, 93, 168, 209, 210, 211]),
  // Coin face text (开元通宝) is a visual element on the copper coin
  'components/cast/ritual-client.tsx': new Set([23, 53, 152, 179, 182, 183, 184, 185]),
  // 阳/阴 are data value comparisons, not UI text
  'components/result/result-client.tsx': new Set([22, 257, 265, 281, 291, 318, 326, 342, 352]),
  'components/result/share-card.tsx': new Set([10, 201]),
  // Locale switcher intentionally shows 中文
  'components/ui/locale-switcher.tsx': new Set([17, 20]),
};

function shouldSkip(relPath: string): boolean {
  return ALLOWED_CHINESE.values().toArray().some(pattern => relPath.includes(pattern));
}

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    if (entry.isDirectory()) {
      results.push(...walk(fp));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      results.push(fp);
    }
  }
  return results;
}

describe('No hardcoded Chinese in client components', () => {
  const files = walk(SRC);

  it('should not have Chinese characters in client-facing component files', () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const fp of files) {
      const rel = path.relative(SRC, fp).replace(/\\/g, '/');
      if (shouldSkip(rel)) continue;

      const lines = fs.readFileSync(fp, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip comments
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
        // Skip imports
        if (trimmed.startsWith('import ')) continue;
        // Skip type annotations / JSDoc
        if (trimmed.startsWith('/**') || trimmed.startsWith('* ')) continue;

        if (ZH_RE.test(line)) {
          // Check if this specific line is allowed
          const allowedLines = ALLOWED_LINES[rel];
          if (allowedLines && allowedLines.has(i + 1)) continue;

          violations.push({
            file: rel,
            line: i + 1,
            text: trimmed.slice(0, 120),
          });
        }
      }
    }

    if (violations.length > 0) {
      console.log(`\nFound ${violations.length} hardcoded Chinese string(s):\n`);
      for (const v of violations) {
        console.log(`  ${v.file}:${v.line}`);
        console.log(`    ${v.text}\n`);
      }
    }

    // We expect 0 violations in client components
    // If this fails, the output above shows exactly where to fix
    expect(violations).toEqual([]);
  });
});
