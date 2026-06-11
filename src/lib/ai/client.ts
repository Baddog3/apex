export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AiProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

const DEFAULT_MAX_TOKENS = 200;
const REQUEST_TIMEOUT_MS = 20_000;

function configuredProviders(): AiProviderConfig[] {
  const providers: AiProviderConfig[] = [];

  const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (deepseekKey) {
    providers.push({
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
      apiKey: deepseekKey,
      model: "deepseek-chat",
    });
  }

  const qwenKey = process.env.QWEN_API_KEY?.trim();
  if (qwenKey) {
    providers.push({
      name: "qwen",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      apiKey: qwenKey,
      model: "qwen-plus",
    });
  }

  return providers;
}

async function requestProvider(
  provider: AiProviderConfig,
  messages: AiChatMessage[],
  maxTokens: number,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${provider.name} HTTP ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error(`${provider.name} empty response`);
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/** OpenAI-compatible chat; DeepSeek → Qwen fallback. */
export async function aiChat(
  messages: AiChatMessage[],
  options: { maxTokens?: number } = {},
): Promise<string | null> {
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const providers = configuredProviders();

  if (providers.length === 0) {
    return null;
  }

  for (const provider of providers) {
    try {
      return await requestProvider(provider, messages, maxTokens);
    } catch {
      continue;
    }
  }

  return null;
}

export function hasAiProvider(): boolean {
  return configuredProviders().length > 0;
}
