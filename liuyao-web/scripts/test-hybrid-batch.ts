/**
 * 分批运行混合分析器测试 — 每3题一个进程，避免连接池问题
 * 用法: npx tsx scripts/test-hybrid-batch.ts
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const BATCH_SIZE = 3;
const TOTAL = 100;
const DELAY_MS = 3000;

interface BatchResult {
  range: string;
  engineExact: number;
  engineClose: number;
  hybridExact: number;
  hybridClose: number;
  processed: number;
  llmCalls: number;
  improvements: string[];
  regressions: string[];
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('🔬 分批混合分析器测试 — 每3题一个进程\n');

  let totalEngine = { exact: 0, close: 0 };
  let totalHybrid = { exact: 0, close: 0 };
  let totalProcessed = 0;
  let totalLLM = 0;
  const allImprovements: string[] = [];
  const allRegressions: string[] = [];
  const failedBatches: string[] = [];

  for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, TOTAL);
    const range = `${start}-${end}`;
    process.stdout.write(`  批次 #${range}...`);

    try {
      const output = execSync(
        `npx tsx scripts/test-hybrid.ts --live --batch=${range} --json`,
        {
          cwd: path.resolve(__dirname, '..'),
          timeout: 90000,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      // Parse JSON output from the test script
      const jsonMatch = output.match(/###JSON###(.+?)###END###/s);
      if (jsonMatch) {
        const result: BatchResult = JSON.parse(jsonMatch[1]);
        totalEngine.exact += result.engineExact;
        totalEngine.close += result.engineClose;
        totalHybrid.exact += result.hybridExact;
        totalHybrid.close += result.hybridClose;
        totalProcessed += result.processed;
        totalLLM += result.llmCalls;
        allImprovements.push(...result.improvements);
        allRegressions.push(...result.regressions);
        console.log(` ✓ ${result.processed}题 (引擎=${result.engineExact} 混合=${result.hybridExact})`);
      } else {
        console.log(' ⚠️ 无 JSON 输出');
        failedBatches.push(range);
      }
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes('TIMEOUT')) {
        console.log(' ⏰ 超时');
      } else {
        console.log(` ❌ 失败`);
      }
      failedBatches.push(range);
    }

    // Delay between batches
    if (start + BATCH_SIZE <= TOTAL) {
      await sleep(DELAY_MS);
    }
  }

  // Final report
  console.log(`\n${'='.repeat(72)}`);
  console.log('📊 总计报告');
  console.log('='.repeat(72));
  console.log(`\n  处理: ${totalProcessed}/99`);
  console.log(`                    纯引擎              混合分析器           提升`);
  const ePct = totalProcessed ? (totalEngine.exact / totalProcessed * 100).toFixed(1) : '0.0';
  const hPct = totalProcessed ? (totalHybrid.exact / totalProcessed * 100).toFixed(1) : '0.0';
  const ecPct = totalProcessed ? (totalEngine.close / totalProcessed * 100).toFixed(1) : '0.0';
  const hcPct = totalProcessed ? (totalHybrid.close / totalProcessed * 100).toFixed(1) : '0.0';
  const diff = totalHybrid.exact - totalEngine.exact;
  const cdiff = totalHybrid.close - totalEngine.close;
  console.log(`  精确匹配:     ${totalEngine.exact}/${totalProcessed} (${ePct}%)       ${totalHybrid.exact}/${totalProcessed} (${hPct}%)       ${diff > 0 ? '+' : ''}${diff}`);
  console.log(`  接近匹配:     ${totalEngine.close}/${totalProcessed} (${ecPct}%)       ${totalHybrid.close}/${totalProcessed} (${hcPct}%)       ${cdiff > 0 ? '+' : ''}${cdiff}`);
  console.log(`  LLM 调用:     —                   ${totalLLM}`);

  if (allImprovements.length > 0) {
    console.log(`\n✅ 改善 (${allImprovements.length}题):`);
    allImprovements.forEach(s => console.log(s));
  }
  if (allRegressions.length > 0) {
    console.log(`\n❌ 回退 (${allRegressions.length}题):`);
    allRegressions.forEach(s => console.log(s));
  }
  if (failedBatches.length > 0) {
    console.log(`\n⚠️ 失败批次: ${failedBatches.join(', ')}`);
  }
  console.log();
}

main().catch(console.error);
