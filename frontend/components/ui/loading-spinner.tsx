"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "gradient";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export default function LoadingSpinner({
  size = "md",
  className,
  variant = "default",
}: LoadingSpinnerProps) {
  return (
    <motion.div
      className={cn(
        "border-2 rounded-full",
        sizeClasses[size],
        variant === "gradient"
          ? "border-purple-500 border-t-transparent"
          : "border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300",
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export { LoadingSpinner };
