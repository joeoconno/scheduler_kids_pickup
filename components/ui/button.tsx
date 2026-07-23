import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type Size = "sm" | "md" | "lg";

export const variantClasses: Record<Variant, string> = {
  primary: "bg-sage-600 text-cream-50 hover:bg-sage-700 shadow-sm",
  secondary: "bg-lavender-500 text-cream-50 hover:bg-lavender-600 shadow-sm",
  outline: "border border-card-border bg-card text-foreground hover:bg-sage-50",
  ghost: "text-foreground hover:bg-sage-50",
  danger: "bg-red-500/90 text-white hover:bg-red-600",
};

export const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const buttonClasses = (variant: Variant = "primary", size: Size = "md") =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size]
  );

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonClasses(variant, size), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
