import { describe, it, expect } from 'vitest';
import { zhCN, type Messages } from '../messages/zh-CN';
import { en } from '../messages/en';

/**
 * Recursively collect all leaf keys from an object as dot-separated paths.
 */
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

/**
 * Recursively collect all leaf keys from an object, including array indices.
 */
function collectAllPaths(obj: unknown, prefix = ''): string[] {
  const paths: string[] = [];
  if (obj === null || obj === undefined) {
    paths.push(prefix);
    return paths;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const p = prefix ? `${prefix}[${i}]` : `[${i}]`;
      if (typeof item === 'object' && item !== null) {
        paths.push(...collectAllPaths(item, p));
      } else {
        paths.push(p);
      }
    });
    return paths;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const p = prefix ? `${prefix}.${k}` : k;
      paths.push(...collectAllPaths(v, p));
    }
    return paths;
  }
  paths.push(prefix);
  return paths;
}

/**
 * Get a nested value by dot-separated path.
 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object' && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('i18n message files', () => {
  const zhKeys = collectKeys(zhCN as unknown as Record<string, unknown>);
  const enKeys = collectKeys(en as unknown as Record<string, unknown>);

  it('zh-CN and en should have the same top-level sections', () => {
    const zhSections = Object.keys(zhCN).sort();
    const enSections = Object.keys(en).sort();
    expect(enSections).toEqual(zhSections);
  });

  it('en should have all keys that zh-CN has', () => {
    const missing = zhKeys.filter(k => !enKeys.includes(k));
    if (missing.length > 0) {
      console.log('Keys in zh-CN but missing in en:', missing);
    }
    expect(missing).toEqual([]);
  });

  it('zh-CN should have all keys that en has', () => {
    const extra = enKeys.filter(k => !zhKeys.includes(k));
    if (extra.length > 0) {
      console.log('Keys in en but missing in zh-CN:', extra);
    }
    expect(extra).toEqual([]);
  });

  it('all leaf values in zh-CN should be non-empty strings or arrays', () => {
    const empty: string[] = [];
    for (const key of zhKeys) {
      const val = getByPath(zhCN as unknown as Record<string, unknown>, key);
      if (typeof val === 'string' && val.trim() === '') {
        empty.push(key);
      }
    }
    expect(empty).toEqual([]);
  });

  it('all leaf values in en should be non-empty strings or arrays', () => {
    const empty: string[] = [];
    for (const key of enKeys) {
      const val = getByPath(en as unknown as Record<string, unknown>, key);
      if (typeof val === 'string' && val.trim() === '') {
        empty.push(key);
      }
    }
    expect(empty).toEqual([]);
  });

  it('en values should not contain Chinese characters (except known exceptions)', () => {
    const EXCEPTIONS = new Set([
      // Login symbol is intentionally Chinese
      'pages.login.symbol',
    ]);

    const zhRe = /[\u4e00-\u9fff]/;
    const violations: string[] = [];

    for (const key of enKeys) {
      if (EXCEPTIONS.has(key)) continue;
      const val = getByPath(en as unknown as Record<string, unknown>, key);
      if (typeof val === 'string' && zhRe.test(val)) {
        violations.push(`${key}: "${val}"`);
      }
    }

    if (violations.length > 0) {
      console.log('Chinese characters found in en.ts:', violations);
    }
    expect(violations).toEqual([]);
  });

  it('arrays in zh-CN and en should have the same length', () => {
    const zhPaths = collectAllPaths(zhCN);
    const enPaths = collectAllPaths(en);

    // Check array-containing paths
    const zhArrayPaths = new Set<string>();
    const enArrayPaths = new Set<string>();

    for (const p of zhPaths) {
      const match = p.match(/^(.+)\[\d+\]/);
      if (match) zhArrayPaths.add(match[1]);
    }
    for (const p of enPaths) {
      const match = p.match(/^(.+)\[\d+\]/);
      if (match) enArrayPaths.add(match[1]);
    }

    const mismatches: string[] = [];
    for (const arrPath of zhArrayPaths) {
      const zhArr = getByPath(zhCN as unknown as Record<string, unknown>, arrPath);
      const enArr = getByPath(en as unknown as Record<string, unknown>, arrPath);
      if (Array.isArray(zhArr) && Array.isArray(enArr)) {
        if (zhArr.length !== enArr.length) {
          mismatches.push(`${arrPath}: zh=${zhArr.length}, en=${enArr.length}`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });

  it('template variables in zh-CN and en should match', () => {
    const templateRe = /\{(\w+)\}/g;
    const mismatches: string[] = [];

    for (const key of zhKeys) {
      const zhVal = getByPath(zhCN as unknown as Record<string, unknown>, key);
      const enVal = getByPath(en as unknown as Record<string, unknown>, key);

      if (typeof zhVal !== 'string' || typeof enVal !== 'string') continue;

      const zhVars = [...zhVal.matchAll(templateRe)].map(m => m[1]).sort();
      const enVars = [...enVal.matchAll(templateRe)].map(m => m[1]).sort();

      if (JSON.stringify(zhVars) !== JSON.stringify(enVars)) {
        mismatches.push(`${key}: zh={${zhVars.join(',')}} en={${enVars.join(',')}}`);
      }
    }

    if (mismatches.length > 0) {
      console.log('Template variable mismatches:', mismatches);
    }
    expect(mismatches).toEqual([]);
  });
});

describe('i18n component coverage', () => {
  it('should have all required message sections', () => {
    const requiredSections = [
      'brand', 'nav', 'common', 'pages', 'home', 'ask', 'cast', 'ritual',
      'processing', 'result', 'history', 'login', 'profile', 'admin',
      'errors', 'auth', 'share', 'shareCard',
    ];

    const zhSections = Object.keys(zhCN);
    const missing = requiredSections.filter(s => !zhSections.includes(s));
    expect(missing).toEqual([]);
  });

  it('result.chart should have all required sub-keys', () => {
    const required = ['primary', 'changed', 'movingLines', 'staticHex', 'movingLinesLabel', 'staticText', 'pending', 'monthBranch', 'dayStemBranch', 'xunkong', 'palace', 'yaoPos', 'shi', 'ying'];
    const actual = Object.keys(zhCN.result.chart);
    const missing = required.filter(k => !actual.includes(k));
    expect(missing).toEqual([]);
  });

  it('login should have register sub-section', () => {
    expect(zhCN.login.register).toBeDefined();
    expect(en.login.register).toBeDefined();
  });

  it('ritual.yaoNames should have 6 entries', () => {
    expect(zhCN.ritual.yaoNames).toHaveLength(6);
    expect(en.ritual.yaoNames).toHaveLength(6);
  });

  it('processing.steps should have 5 entries', () => {
    expect(zhCN.processing.steps).toHaveLength(5);
    expect(en.processing.steps).toHaveLength(5);
  });

  it('result.chart.yaoPos should have 6 entries', () => {
    expect(zhCN.result.chart.yaoPos).toHaveLength(6);
    expect(en.result.chart.yaoPos).toHaveLength(6);
  });

  it('ask.categories should have all 7 categories', () => {
    const expected = ['relationship', 'career', 'wealth', 'health', 'study', 'lost', 'other'];
    const actual = Object.keys(zhCN.ask.categories);
    expect(actual.sort()).toEqual(expected.sort());
    expect(Object.keys(en.ask.categories).sort()).toEqual(expected.sort());
  });

  it('auth section should have all error translation keys', () => {
    const required = ['unavailable', 'otpSent', 'magicLinkSent', 'registerSuccess', 'notLoggedIn', 'invalidCredentials', 'emailNotConfirmed', 'alreadyRegistered', 'passwordTooShort', 'rateLimit', 'emailLimit', 'authFailed'];
    const actual = Object.keys(zhCN.auth);
    const missing = required.filter(k => !actual.includes(k));
    expect(missing).toEqual([]);
  });
});
