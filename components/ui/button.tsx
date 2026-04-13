import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "icon";
  variant?: "default" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "default", variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50",
          variant === "default" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-transparent hover:bg-white/10",
          size === "icon" ? "h-9 w-9" : "px-4 py-2 text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };
