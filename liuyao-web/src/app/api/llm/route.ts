import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `你是一位精通京房纳甲六爻体系的资深命理分析师。你的任务是基于用户提供的排盘数据，给出结构化的六爻分析结果。

## 分析原则
1. 排盘数据为准：不要自行重新排盘，直接使用提供的数据。
2. 双层输出：同时面向完全不懂六爻的普通用户（卦象解读）和略懂六爻的爱好者（断卦释义）。
3. 克制不夸张：不要给出绝对化的断语，用"倾向""可能""目前看"等措辞。
4. 实用导向：分析要落到用户能做的事上，给出可操作的建议。
5. 不编造细节：如果卦象信息不足以给出某方面判断，如实说明。

## 输出格式
严格按以下 JSON 格式输出，不要输出任何其他内容。所有文本字段使用纯文本，不要包含 markdown 标记（如 **、##、- 等）。

\`\`\`json
{
  "summary": "基础结论，分条列出核心判断要点，格式为：1. 第一点；2. 第二点；3. 第三点；4. 第四点。每条简明扼要，总共 4-6 条，涵盖：整体吉凶判断、核心卦象含义、关键动爻影响、行动建议方向。",
  "plainAnalysis": "卦象解读，面向完全不懂六爻的普通用户，800-1500 字。内容分为以下几个部分，每部分用【】标注标题：【整体判断】概括本卦整体吉凶和方向；【本卦解读】解释本卦的核心含义，用生活化的比喻；【变化趋势】解释动爻带来的变化，变卦代表的走向；【具体分析】结合用户的具体问题，分析当前状态和未来趋势；【行动建议】给出 2-3 条可操作的具体建议；【时间参考】如果可以推断，给出时间节点参考。全程用日常口语，不要专业术语。",
  "professionalAnalysis": "断卦释义，面向略懂六爻的爱好者，600-1200 字。内容分为以下几个部分，每部分用【】标注标题：【用神分析】用神取法依据、用神旺衰状态（得令/得地/得生/得助）；【动爻影响】动爻生克关系、变爻进退神分析；【世应关系】世爻应爻状态、主客关系判断；【特殊因素】旬空、月破、暗动、伏神等特殊情况；【六神象法】六神配合卦象的象意解读；【应期推断】根据用神状态推断应期时间；【综合判断】汇总以上分析给出最终结论。使用专业术语但保持条理清晰。"
}
\`\`\``;

// Model config
function getModelConfig() {
  const key = process.env.LLM_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, '');
  const model = process.env.LLM_MODEL || 'doubao-seed-2-0-code-preview-260215';
  return { key, url: baseUrl, model };
}

/** Read an SSE stream and accumulate the content */
async function readStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let content = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete lines from buffer
    const lines = buffer.split('\n');
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) content += delta;
      } catch {
        // skip malformed chunks
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim().startsWith('data: ')) {
    const data = buffer.trim().slice(6);
    if (data !== '[DONE]') {
      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) content += delta;
      } catch {
        // skip
      }
    }
  }

  return content;
}

export async function POST(request: Request) {
  const config = getModelConfig();
  if (!config.key) {
    return NextResponse.json({ success: false, error: 'LLM not configured' }, { status: 500 });
  }

  let body: { prompt: string };
  try {
    body = await request.json() as { prompt: string };
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  if (!body.prompt) {
    return NextResponse.json({ success: false, error: 'Missing prompt' }, { status: 400 });
  }

  // Try both URL patterns: /chat/completions and /v1/chat/completions
  const urls = [`${config.url}/chat/completions`, `${config.url}/v1/chat/completions`];
  let lastError = '';

  for (const url of urls) {
    try {
      console.info(`[llm-proxy] Calling ${url} model=${config.model} stream=true`);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.key}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: body.prompt },
          ],
          max_tokens: 4096,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[llm-proxy] API error ${res.status}: ${errText.slice(0, 200)}`);
        lastError = `API ${res.status}: ${errText.slice(0, 100)}`;
        continue;
      }

      if (!res.body) {
        lastError = 'No response body';
        continue;
      }

      // Pass-through stream to client — keeps the connection alive and avoids Edge timeout
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      (async () => {
        const encoder = new TextEncoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
                }
              } catch {
                // skip malformed
              }
            }
          }
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          console.error('[llm-proxy] Stream error:', (err as Error).message);
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (err) {
      lastError = (err as Error).message;
      console.error(`[llm-proxy] Error with ${url}:`, lastError);
    }
  }

  return NextResponse.json({ success: false, error: lastError }, { status: 500 });
}
