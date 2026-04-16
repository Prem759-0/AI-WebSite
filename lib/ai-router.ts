
  export const MODEL_MAP: Record<string, string> = {
  text: "mistralai/mistral-7b-instruct:free", // Very stable free model
  code: "mistralai/mistral-7b-instruct:free",
  roleplay: "z-ai/glm-4.5-air:free",
  tech: "nvidia/nemotron-3-super-120b-a12b:free",
  science: "nvidia/nemotron-3-super-120b-a12b:free",
  translate: "minimax/minimax-m2.5:free"
};
export function detectIntent(message: string): string {
  const msg = message.toLowerCase();
  if (msg.match(/code|bug|error|function|react/)) return "code";
  if (msg.match(/translate|meaning|language/)) return "translate";
  if (msg.match(/science|physics|explain/)) return "science";
  return "text";
}
