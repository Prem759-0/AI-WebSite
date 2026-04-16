export const MODEL_MAP: Record<string, string> = {
  // The ultimate fail-safe: automatically picks an available free model
  text: "openrouter/free",
  // Highly stable, specialized free models for specific tasks
  code: "openai/gpt-oss-120b:free",
  roleplay: "z-ai/glm-4.5-air:free",
  tech: "nvidia/nemotron-3-super-120b-a12b:free",
  science: "google/gemma-4-26b-a4b-it:free",
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
