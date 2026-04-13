export const MODEL_MAP: Record<string, string> = {
  text: "google/gemma-4-26b-a4b-it:free",
  code: "openai/gpt-oss-120b:free",
  roleplay: "z-ai/glm-4.5-air:free",
  tech: "nvidia/nemotron-3-super-120b-a12b:free",
  science: "nvidia/nemotron-3-super-120b-a12b:free",
  translate: "minimax/minimax-m2.5:free",
  finance: "openai/gpt-oss-120b:free",
  seo: "openai/gpt-oss-120b:free"
};

export function detectIntent(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("code") || msg.includes("error") || msg.includes("bug") || msg.includes("fix")) return "code";
  if (msg.includes("translate") || msg.includes("meaning")) return "translate";
  if (msg.includes("story") || msg.includes("imagine") || msg.includes("roleplay")) return "roleplay";
  if (msg.includes("science") || msg.includes("how does") || msg.includes("explain deeply")) return "science";
  if (msg.includes("money") || msg.includes("seo") || msg.includes("business")) return "finance";
  return "text";
}
