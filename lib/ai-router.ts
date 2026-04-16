export const MODEL_MAP: Record<string, string> = {
  // Using highly stable Meta Llama 3.1 and Microsoft Phi-3 free models
  text: "meta-llama/llama-3.1-8b-instruct:free",
  code: "meta-llama/llama-3.1-8b-instruct:free",
  roleplay: "microsoft/phi-3-mini-128k-instruct:free",
  tech: "meta-llama/llama-3.1-8b-instruct:free",
  science: "microsoft/phi-3-mini-128k-instruct:free",
  translate: "meta-llama/llama-3.1-8b-instruct:free"
};

export function detectIntent(message: string): string {
  const msg = message.toLowerCase();
  if (msg.match(/code|bug|error|function|react/)) return "code";
  if (msg.match(/translate|meaning|language/)) return "translate";
  if (msg.match(/science|physics|explain/)) return "science";
  if (msg.match(/act like|story|imagine/)) return "roleplay";
  return "text";
}
