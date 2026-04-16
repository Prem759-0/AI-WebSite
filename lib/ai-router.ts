export const MODEL_MAP: Record<string, string> = {
  text: "google/gemma-2-9b-it:free",
  code: "google/gemma-2-9b-it:free",
  roleplay: "google/gemma-2-9b-it:free",
  tech: "google/gemma-2-9b-it:free",
  science: "google/gemma-2-9b-it:free",
  translate: "google/gemma-2-9b-it:free"
};

export function detectIntent(message: string): string {
  // Simple logic to keep it working
  return "text";
}
