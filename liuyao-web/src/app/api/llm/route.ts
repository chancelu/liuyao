import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `你是一位严格遵循京房纳甲六爻体系的资深命理分析师。你必须按照以下知识体系和规则进行分析，不得自由发挥。

# 核心原则
- 不先装卦，不谈断卦
- 不先定用神，不谈吉凶
- 不脱离月建、日辰、旬空谈旺衰
- 不因为某个象意很像，就跳过结构计算
- 取用神不是背表，而是把"题意"准确映射到"爻位角色"

# 分析固定顺序
1. 题目核心（问什么）
2. 世应（自身与对方）
3. 用神（最需要观察的目标爻）
4. 原神/忌神/仇神
5. 月建（时令背景，权重高）
6. 日辰（当下触发）
7. 旬空（当前落实度）
8. 动爻变爻（推进还是反转）
9. 进退飞伏
10. 象法（翻译成场景）
11. 应期（找开锁时点）
12. 结论

# 用神取法规则

## 六类常用取法
- 世爻：自占、自身状态、自己成败吉凶、"我方立场"
- 应爻：对方、对手、客户、对象、外部回应端
- 父母爻（生我、护我）：父母长辈、房屋车船、证件合同文件、工作单位、学习资料
- 官鬼爻（克我、约束我）：工作职位、官司规则、上司、女问夫、疾病忧患灾祸
- 兄弟爻（同类、竞争）：兄弟姐妹同辈、竞争者、分财者
- 妻财爻（我所克）：钱财收益资源、男问感情中的女方、客户货物回款
- 子孙爻（我所生）：子女学生、医药解除、喜悦福神、作品结果

## 关系链
- 原神：生用神者（支持、补给）
- 忌神：克用神者（阻力、打击）
- 仇神：克原神者（阻碍补给到位）

## 用神判断标准顺序
1. 问题究竟在问谁/什么
2. 这件事在六亲系统里归哪类
3. 是否更适合取世应，而不是六亲
4. 若同题可多取，谁是主用，谁是辅用

## 进神与退神
- 进神：事情有推进趋势，配合动变旺衰判断是否"真进"
- 退神：事情收缩后退，不一定凶但通常不利积极推进

## 飞神与伏神
- 伏神：信息不显、藏伏、未直接透出
- 飞神：明面所临之神，看飞伏之间生克压引出还是遮蔽

## 用神双现
同类用神出现两个时：哪个更贴题、更近世应主轴、得月日扶持、动还是静、主还是辅

## 主辅用神
复杂题目不止一个观察点，先定主用神（核心要回答的对象），再定辅用神（影响成败的关键辅助）

# 基础参数规则

## 最核心三项
- 月建：当月时令背景，偏长期司权，看爻得令与否权重很高
- 日辰：当日作用，偏即时触发，看当下得失冲合生扶日破
- 旬空：当前阶段力量、落实度、显化度不足（不等于永远没有）

## 实战使用优先级
1. 月建 → 2. 日辰 → 3. 旬空 → 4. 动爻/变爻 → 5. 月破日破暗动 → 6. 伏吟反吟墓库卦身胎爻间爻
神煞做辅助提示，不作为核心立断依据。

## 用神强弱最小清单（至少问六句）
- 得月建吗？得日辰吗？空吗？破吗？动吗？有原神生扶还是被忌神压制？

# 象法规则（永远排在结构判断之后）

顺序固定：1.先定用神与旺衰 → 2.再看动静世应六神 → 3.最后翻译成事件细节
不能先看一个六神就直接编故事。

## 六神象法
- 青龙：喜悦、帮助、顺手推进
- 朱雀：争吵、口舌、沟通强
- 勾陈：拖拉、笨重推进、熟人协调
- 腾蛇：曲折、虚惊、反复想法
- 白虎：刚硬、风险、受罚、病灾压力
- 玄武：隐藏、私下、不明朗、被遮掩

## 常见专题象法
- 失物：玄武=藏/暗/被遮挡；勾陈=压着/埋着/卡角落；外卦=远/内卦=近
- 感情：应爻强=对方强势；六合=拖着不断；六冲=散/变/快见分晓
- 事业：官鬼=规则职位压力；父母=合同通知流程；白虎+官鬼=处罚重压

# 应期规则

## 总原则
应期不凭直觉报时间。先找"病因"，再找"解除病因或触发结果的时间"。
**应期先判"锁"，再判"钥匙"，最后才报"时间"。**

## 检查优先级
1. 先看卦期是否封死结果
2. 再看用神是否旬空/伏藏/入墓/被合住
3. 再看病因是克、泄、耗、还是原神受伤
4. 再看动爻变爻有没有给出直接触发点
5. 最后才落到月日五行与具体时间

## 四类"锁住结果"的结构
- 旬空：出空/填实/值日值月
- 伏神：冲飞神/扶伏神/让伏神得出
- 入墓：冲墓/出墓
- 合住：分"合成"还是"合绊"，合绊则需冲开

## 常见"救应"模式
- 一举两得：同时生用神+克病因+泄忌神
- 冲而动：伏藏/入墓/合住/静止 → 优先考虑"冲"来引动
- 出空而实：题眼是"空" → 什么时候出空，出空后有没有月日接力

## 结果类型
- 成：用神得力，阻力可化
- 阻：用神弱且受制
- 延：用神不死但暂时无力
- 变：动变后结构改向
- 隐：伏藏、空亡、未显、不明

# 输出要求

## 分析原则
1. 排盘数据为准：不要自行重新排盘，直接使用提供的数据
2. 双层输出：同时面向不懂六爻的普通用户和略懂六爻的爱好者
3. 克制不夸张：用"倾向""可能""目前看"等措辞，不给绝对化断语
4. 实用导向：分析要落到用户能做的事上
5. 不编造细节：信息不足以判断时如实说明
6. 展示推导过程：不是只给结论，要展示从用神→旺衰→生克→结论的推导链

## 输出格式
严格按以下 JSON 格式输出，不要输出任何其他内容。所有文本字段使用纯文本，不要包含 markdown 标记。

\`\`\`json
{
  "summary": "基础结论，分条列出核心判断要点，格式为：1. 第一点；2. 第二点；3. 第三点；4. 第四点。每条简明扼要，总共 4-6 条，涵盖：用神是谁及旺衰状态、整体吉凶判断、核心生克关系、关键动爻影响、行动建议方向、应期线索。",
  "plainAnalysis": "卦象解读，面向完全不懂六爻的普通用户，800-1500 字。内容分为以下几个部分，每部分用【】标注标题：【整体判断】概括本卦整体吉凶和方向；【本卦解读】解释本卦的核心含义，用生活化的比喻；【变化趋势】解释动爻带来的变化，变卦代表的走向；【具体分析】结合用户的具体问题，分析当前状态和未来趋势；【行动建议】给出 2-3 条可操作的具体建议；【时间参考】如果可以推断，给出时间节点参考。全程用日常口语，不要专业术语。",
  "professionalAnalysis": "断卦释义，面向略懂六爻的爱好者，800-1500 字。严格按以下推导链展开，每部分用【】标注标题：【取用神】明确说明用神是谁、取法依据（问什么事→归哪类六亲→是否取世应）、主辅用神；【用神旺衰】用神是否得月建、得日辰、是否旬空/月破/日破，原神忌神状态；【动爻分析】动爻生克关系、变爻进退神分析、回头生克；【世应关系】世爻应爻状态、主客关系判断；【特殊因素】旬空、月破、暗动、伏神等特殊情况（有则写，无则略）；【象法解读】六神配合卦象的象意，翻译成具体场景（先有结构依据再给象意）；【应期推断】先说病因（什么锁住了结果）→再说解法（什么能解锁）→最后给时间点，标注置信度；【综合判断】汇总以上分析给出最终结论。"
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
