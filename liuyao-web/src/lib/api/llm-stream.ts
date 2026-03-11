/**
 * Call /api/llm and read the SSE stream, accumulating content into a complete JSON string.
 * Returns the parsed analysis object or null on failure.
 */
export async function callLLMStream(prompt: string): Promise<{
  summary: string;
  plainAnalysis: string;
  professionalAnalysis: string;
} | null> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    console.warn('[llm-stream] API returned', res.status);
    return null;
  }

  const contentType = res.headers.get('content-type') || '';

  // If server returned JSON directly (non-streaming fallback)
  if (contentType.includes('application/json')) {
    const data = await res.json() as {
      success: boolean;
      data?: { summary: string; plainAnalysis: string; professionalAnalysis: string };
    };
    return data.success && data.data ? data.data : null;
  }

  // Read SSE stream
  const reader = res.body?.getReader();
  if (!reader) return null;

  const decoder = new TextDecoder();
  let content = '';
  let buffer = '';

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
        const parsed = JSON.parse(data) as { content?: string };
        if (parsed.content) content += parsed.content;
      } catch {
        // skip
      }
    }
  }

  if (!content) return null;

  // Parse JSON from accumulated content
  let jsonStr = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn('[llm-stream] Failed to parse JSON:', (err as Error).message, jsonStr.slice(0, 200));
    return null;
  }
}
