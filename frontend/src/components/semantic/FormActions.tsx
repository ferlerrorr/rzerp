import { ReactNode } from "react";

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export function FormActions({ children, className = "" }: FormActionsProps) {
  return <div className={`form-actions ${className}`}>{children}</div>;
}

