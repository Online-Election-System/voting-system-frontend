// src/components/ui/custom-alert.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReactNode } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type AlertProps = {
  title: string;
  message: string | ReactNode;
  variant?: "default" | "destructive";
  className?: string;
};

export function CustomAlert({
  title,
  message,
  variant = "default",
  className,
}: AlertProps) {
  return (
    <Alert variant={variant} className={className}>
      {variant === "destructive" ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
