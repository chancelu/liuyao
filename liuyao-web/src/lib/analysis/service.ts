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

从本卦${chart.primary.name}来看，它属于${chart.primary.palace}宫，五行属${chart.primary.palaceElement}。这个卦象反映的是你当前所处的状态和环境。${movingCount > 0 ? `而变卦${chart.changed.name}属于${chart.changed.palace}宫，代表事情发展的方向和最终趋势。从本卦到变卦的变化过程，就是这件事接下来可能的走向。` : `由于是静卦，事态目前处于相对稳定的阶段，短期内不会有剧烈变化。`}

${movingCount > 0 ? `动爻出现在第${chart.movingLines.join('、')}爻的位置。动爻是整个卦象中最活跃的部分，代表正在发生变化的因素。这些变化直接影响着事情的走向。动爻越多，说明事态越不稳定，变数越大，需要你更加灵活地应对。` : ''}

世爻在第${chart.shiPosition}爻，代表你自身的状态和立场；应爻在第${chart.yingPosition}爻，代表对方或者事态的另一面。世爻的强弱反映了你在这件事中的主动权和掌控力，应爻则反映了外部环境或对方的态度。两者之间的互动关系，是判断这件事走向的核心线索。

从${tsLabel}的时间维度来看，这件事的重点不在一瞬间的好坏，而在于它还处在变化当中。${movingCount >= 2 ? '多处动爻意味着局势还没有定型，现在下结论为时过早。' : '整体趋势偏向稳定，但仍需关注细微变化。'}

具体建议：${movingCount >= 2 ? '保持灵活应对，不要急于做最终决定。当前最重要的是观察局势的进一步发展，等信号更明确了再行动。同时注意保持自身状态的稳定，不要因为外部变化而乱了阵脚。' : '先稳住当前状态，耐心观察后续变化。不宜急躁冒进，也不必过于担忧。按部就班地推进，等待合适的时机再做重要决策。保持平常心，顺势而为。'}

总的来说，这个卦象告诉你的核心信息是：事情还在发展中，${summary.replace('。', '，')}保持耐心和灵活性是当前最好的策略。`;

  const movingDesc = chart.movingLines.length > 0
    ? `动爻位于第${chart.movingLines.join('、')}爻。动爻的变化表明事态正在发展中，需要关注动爻所代表的六亲角色及其变化方向。`
    : '本次为静卦，各爻暂无明显变动，事态处于相对稳定状态。';

  const professionalAnalysis = `一、卦象概述

本卦${chart.primary.name}（${chart.primary.palace}宫，五行属${chart.primary.palaceElement}），变卦${chart.changed.name}（${chart.changed.palace}宫，五行属${chart.changed.palaceElement}）。${movingDesc}

二、用神分析

根据所问${catLabel}类问题，取用神需参考六亲体系。世爻（第${chart.shiPosition}爻）纳支${chart.lines[chart.shiPosition - 1].branch}${chart.lines[chart.shiPosition - 1].branchElement}，六亲属${chart.lines[chart.shiPosition - 1].relative}，六神为${chart.lines[chart.shiPosition - 1].spirit}；应爻（第${chart.yingPosition}爻）纳支${chart.lines[chart.yingPosition - 1].branch}${chart.lines[chart.yingPosition - 1].branchElement}，六亲属${chart.lines[chart.yingPosition - 1].relative}，六神为${chart.lines[chart.yingPosition - 1].spirit}。

三、月建日辰与旺衰

月建${chart.monthBranch}、日辰${chart.dayStem}${chart.dayBranch}。用神在月建和日辰下的旺衰状态，直接决定了其力量强弱。得月令者旺，失月令者衰；得日辰生扶者有力，受日辰克制者减力。需综合判断用神是否得时得地。

四、旬空分析

旬空为${chart.xunkong[0]}${chart.xunkong[1]}。需注意关键爻是否落入旬空。若用神逢空，则事有虚象，需待出空方可应验。逢空不一定是坏事，要看具体情况：真空则事不成，假空则待时而发。

五、六爻详情

${chart.lines.map(l => {
    let desc = `第${l.position}爻：${l.yinYang}（${l.branch}${l.branchElement}）六亲=${l.relative} 六神=${l.spirit}`;
    if (l.isShi) desc += ' [世]';
    if (l.isYing) desc += ' [应]';
    if (l.moving) desc += ` 【动】→ ${l.changedBranch ?? '?'} ${l.changedRelative ?? '?'}`;
    return desc;
  }).join('\n')}

六、综合判断

从世应关系、用神旺衰、动变趋势综合来看，${summary} ${movingCount >= 2 ? '多爻齐动，局势尚未定型，应期可能在动爻所代表的地支月份或日期。' : '整体趋势偏稳，变化幅度有限，应期参考用神所临地支。'}

（注：此为系统自动生成的框架性分析。接入 AI 服务后将提供更深入的个性化解读，包括更精确的用神旺衰判断、动变生克分析和应期推断。）`;

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
          max_tokens: 4096,
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
