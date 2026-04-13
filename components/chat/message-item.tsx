import { cn } from "@/lib/utils";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageItem = ({ role, content }: MessageItemProps) => {
  return (
    <div className={cn("flex w-full mb-4", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-lg",
          role === "user" 
            ? "bg-blue-600 text-white rounded-br-none" 
            : "glass-panel text-white rounded-bl-none"
        )}
      >
        {content}
      </div>
    </div>
  );
};
