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

// Model configs: primary (Claude) and fallback (GPT)
function getModelConfigs() {
  const primaryKey = process.env.LLM_API_KEY_PRIMARY || process.env.LLM_API_KEY;
  const primaryUrl = (process.env.LLM_BASE_URL_PRIMARY || process.env.LLM_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
  const primaryModel = process.env.LLM_MODEL_PRIMARY || process.env.LLM_MODEL || 'claude-sonnet-4-6';

  const fallbackKey = process.env.LLM_API_KEY_FALLBACK || process.env.LLM_API_KEY;
  const fallbackUrl = (process.env.LLM_BASE_URL_FALLBACK || process.env.LLM_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
  const fallbackModel = process.env.LLM_MODEL_FALLBACK || process.env.LLM_MODEL || 'gpt-4o';

  return [
    { key: primaryKey, url: primaryUrl, model: primaryModel, label: 'primary' },
    { key: fallbackKey, url: fallbackUrl, model: fallbackModel, label: 'fallback' },
  ].filter(c => c.key);
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
  const configs = getModelConfigs();
  if (configs.length === 0) {
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

  let lastError = '';

  for (const config of configs) {
    const urls = [`${config.url}/v1/chat/completions`, `${config.url}/chat/completions`];

    for (const url of urls) {
      try {
        console.info(`[llm-proxy] Calling ${config.label}: ${url} model=${config.model}`);
        
        // Try streaming first
        let content = '';
        try {
          const streamRes = await fetch(url, {
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

          if (streamRes.ok) {
            content = await readStream(streamRes);
          }
        } catch (streamErr) {
          console.warn(`[llm-proxy] ${config.label} stream failed, trying non-stream:`, (streamErr as Error).message);
        }

        // Fallback to non-streaming if stream returned no content
        if (!content) {
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
            }),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error(`[llm-proxy] ${config.label} API error ${res.status}: ${errText.slice(0, 200)}`);
            lastError = `${config.label} API ${res.status}`;
            continue;
          }

          const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
          content = data.choices?.[0]?.message?.content || '';
        }

        if (!content) {
          lastError = `${config.label}: No content in stream`;
          continue;
        }

        // Parse JSON from response
        let jsonStr = content;
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        }

        const parsed = JSON.parse(jsonStr);
        console.info(`[llm-proxy] ${config.label} success`);
        return NextResponse.json({ success: true, data: parsed });
      } catch (err) {
        lastError = `${config.label}: ${(err as Error).message}`;
        console.error(`[llm-proxy] Error with ${config.label} ${url}:`, lastError);
      }
    }
  }

  return NextResponse.json({ success: false, error: lastError }, { status: 500 });
}
