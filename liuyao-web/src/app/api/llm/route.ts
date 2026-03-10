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

export async function POST(request: Request) {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
  const model = process.env.LLM_MODEL || 'gpt-4o';

  if (!apiKey) {
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

  const urls = [`${baseUrl}/v1/chat/completions`, `${baseUrl}/chat/completions`];
  let lastError = '';

  for (const url of urls) {
    try {
      console.info(`[llm-proxy] Calling ${url} model=${model}`);
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
            { role: 'user', content: body.prompt },
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[llm-proxy] API error ${res.status}: ${errText.slice(0, 200)}`);
        lastError = `API ${res.status}`;
        continue;
      }

      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        lastError = 'No content in response';
        continue;
      }

      // Parse JSON from response
      let jsonStr = content;
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      return NextResponse.json({ success: true, data: parsed });
    } catch (err) {
      lastError = (err as Error).message;
      console.error(`[llm-proxy] Error with ${url}:`, lastError);
    }
  }

  return NextResponse.json({ success: false, error: lastError }, { status: 500 });
}
