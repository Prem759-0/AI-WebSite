export const MODEL_MAP: Record<string, string> = {
  // Brand new, active 2026 OpenRouter Free Models
  text: "meta-llama/llama-3.3-70b-instruct:free",
  code: "openai/gpt-oss-120b:free",
  roleplay: "google/gemma-3-27b-it:free",
  tech: "nvidia/nemotron-3-super-120b-a12b:free",
  science: "qwen/qwen3-coder:free",
  translate: "minimax/minimax-m2.5:free"
};

export function detectIntent(message: string): string {
  const msg = message.toLowerCase();
  if (msg.match(/code|bug|error|function|react/)) return "code";
  if (msg.match(/translate|meaning|language/)) return "translate";
  if (msg.match(/science|physics|explain/)) return "science";
  if (msg.match(/act like|story|imagine/)) return "roleplay";
  return "text";
}
