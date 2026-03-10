/**
 * AI 分析服务 — Claude API 对接 + fallback
 */

import type { AnalysisInput, AnalysisOutput } from './types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';

// ---------------------------------------------------------------------------
// Deterministic fallback（无 API key 时使用）
// ---------------------------------------------------------------------------

function buildFallbackAnalysis(input: AnalysisInput): AnalysisOutput {
  const { chart, question, category, timeScope } = input;
  const movingCount = chart.movingLines.length;

  const categoryMap: Record<string, string> = {
    relationship: '感情',
    career: '事业',
    wealth: '财运',
    health: '健康',
    study: '学业',
    lost: '失物',
    other: '这件事',
  };
  const catLabel = categoryMap[category] ?? '这件事';

  const summaryMap: Record<string, [string, string]> = {
    relationship: ['眼下阻力较重，但关系并未彻底走死，仍有转圜余地。', '关系仍有牵连，短期更像观望而不是定局。'],
    career: ['事情有变化空间，但不适合急推，稳扎稳打更好。', '当前更像在等时机，不宜只看眼下。'],
    wealth: ['财上有波动，先守后取更稳，不宜冒进。', '不是没有机会，但进展不会特别快。'],
    health: ['先看缓和与转机，短期仍需耐心调养。', '眼下偏保守，恢复节奏比结果本身更重要。'],
    study: ['成绩与状态都在变动，关键是后续能否稳住。', '更像基础未稳，需要一点时间累积。'],
    lost: ['当前不算顺手，但后面仍有转回来的机会。', '先别急着下死结论，线索还没有完全断。'],
    other: ['这件事并非静止，后面还有变化。', '当下信号偏保守，需要继续观察。'],
  };
  const [movingSummary, staticSummary] = summaryMap[category] ?? summaryMap.other;
  const summary = movingCount >= 2 ? movingSummary : staticSummary;

  const timeScopeLabel: Record<string, string> = {
    recent: '近期',
    this_month: '本月',
    this_year: '今年',
    unspecified: '未来一段时间',
  };
  const tsLabel = timeScopeLabel[timeScope] ?? '未来一段时间';

  const plainAnalysis = `你问的是「${question}」。从当前排盘来看，本卦为${chart.primary.name}，变卦为${chart.changed.name}，${movingCount > 0 ? `有${movingCount}处动爻` : '为静卦'}。

关于${catLabel}方面，${summary}

从整体趋势看，${tsLabel}内这件事的重点不在一瞬间的好坏，而在于它还处在变化当中。世爻在第${chart.shiPosition}爻，代表你自身的状态；应爻在第${chart.yingPosition}爻，代表对方或事态的走向。两者之间的关系是理解这件事走向的关键。

建议你${movingCount >= 2 ? '保持灵活应对，不要急于做最终决定，等局势再明朗一些' : '先稳住当前状态，耐心观察后续变化，不宜急躁冒进'}。`;

  const movingDesc = chart.movingLines.length > 0
    ? `动爻位于第${chart.movingLines.join('、')}爻。动爻的变化表明事态正在发展中，需要关注动爻所代表的六亲角色及其变化方向。`
    : '本次为静卦，各爻暂无明显变动，事态处于相对稳定状态。';

  const professionalAnalysis = `本卦${chart.primary.name}（${chart.primary.palace}宫，五行属${chart.primary.palaceElement}），变卦${chart.changed.name}（${chart.changed.palace}宫）。

${movingDesc}

世爻（第${chart.shiPosition}爻）纳支${chart.lines[chart.shiPosition - 1].branch}${chart.lines[chart.shiPosition - 1].branchElement}，六亲属${chart.lines[chart.shiPosition - 1].relative}；应爻（第${chart.yingPosition}爻）纳支${chart.lines[chart.yingPosition - 1].branch}${chart.lines[chart.yingPosition - 1].branchElement}，六亲属${chart.lines[chart.yingPosition - 1].relative}。

月建${chart.monthBranch}、日辰${chart.dayStem}${chart.dayBranch}，旬空为${chart.xunkong[0]}${chart.xunkong[1]}。需注意关键爻是否落入旬空，若用神逢空则事有虚象，需待出空方可应验。

（注：此为系统自动生成的框架性分析。接入 AI 服务后将提供更深入的个性化解读。）`;

  return { summary, plainAnalysis, professionalAnalysis };
}

// ---------------------------------------------------------------------------
// OpenAI-compatible API 调用（支持中转站）
// ---------------------------------------------------------------------------

async function callLLMAPI(input: AnalysisInput): Promise<AnalysisOutput> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error('LLM_API_KEY not configured');
  }

  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
  const model = process.env.LLM_MODEL || 'gpt-4o';

  const userPrompt = buildUserPrompt(input);

  // Try baseUrl directly, then with /v1 suffix
  let lastError: Error | null = null;
  for (const url of [`${baseUrl}/v1/chat/completions`, `${baseUrl}/chat/completions`]) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        lastError = new Error(`LLM API ${res.status}: ${errText.slice(0, 300)}`);
        continue;
      }

      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('LLM API returned no content');
      }

      return parseAnalysisOutput(content);
    } catch (err) {
      lastError = err as Error;
      // Try next URL variant
    }
  }

  throw lastError ?? new Error('LLM API call failed');
}

// ---------------------------------------------------------------------------
// 结构化输出解析
// ---------------------------------------------------------------------------

function parseAnalysisOutput(raw: string): AnalysisOutput {
  // Try to extract JSON from markdown code block or raw JSON
  let jsonStr = raw;

  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    const plainAnalysis = typeof parsed.plainAnalysis === 'string' ? parsed.plainAnalysis : '';
    const professionalAnalysis = typeof parsed.professionalAnalysis === 'string' ? parsed.professionalAnalysis : '';

    if (!summary || !plainAnalysis || !professionalAnalysis) {
      throw new Error('Missing required fields in analysis output');
    }

    return { summary, plainAnalysis, professionalAnalysis };
  } catch (err) {
    throw new Error(`Failed to parse analysis output: ${(err as Error).message}\nRaw: ${raw.slice(0, 500)}`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface AnalysisResult {
  analysis: AnalysisOutput;
  isAI: boolean;
}

/**
 * 执行六爻分析。优先使用 Claude API，若不可用则降级为确定性 fallback。
 */
export async function analyzeChart(input: AnalysisInput): Promise<AnalysisResult> {
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    console.info('[analysis] No LLM_API_KEY, using deterministic fallback');
    return { analysis: buildFallbackAnalysis(input), isAI: false };
  }

  try {
    const analysis = await callLLMAPI(input);
    return { analysis, isAI: true };
  } catch (err) {
    console.error('[analysis] LLM API call failed, falling back to deterministic:', err);
    return { analysis: buildFallbackAnalysis(input), isAI: false };
  }
}
