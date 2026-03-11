import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `你是一位精通京房纳甲六爻体系的资深命理分析师。你的任务是基于用户提供的排盘数据，给出结构化的六爻分析结果。

## 分析原则
1. 排盘数据为准：不要自行重新排盘，直接使用提供的数据。
2. 双层输出：同时面向完全不懂六爻的小白用户（白话）和略懂六爻的爱好者（专业）。
3. 克制不夸张：不要给出绝对化的断语，用"倾向""可能""目前看"等措辞。
4. 实用导向：分析要落到用户能做的事上，给出可操作的建议。
5. 不编造细节：如果卦象信息不足以给出某方面判断，如实说明。

## 输出格式
严格按以下 JSON 格式输出，不要输出任何其他内容：

\`\`\`json
{
  "summary": "一句话结论，不超过 80 字，概括核心判断和建议方向",
  "plainAnalysis": "白话分析，面向完全不懂六爻的小白用户，800-1500 字。要求：1）先概括整体判断；2）解释本卦和变卦含义；3）解释动爻变化；4）结合具体问题分析状态和趋势；5）给出可操作建议；6）时间节点参考。全程用日常口语，不要专业术语。",
  "professionalAnalysis": "专业分析，面向略懂六爻的爱好者，600-1200 字。要求：1）用神及取法依据；2）用神旺衰状态；3）动爻生克影响；4）世应关系；5）旬空影响；6）六神象法；7）应期推断；8）综合判断。使用专业术语但保持条理清晰。"
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
