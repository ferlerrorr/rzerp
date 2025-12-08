import { ReactNode } from "react";

interface ParagraphProps {
  children: ReactNode;
  className?: string;
}

export function Paragraph({ children, className = "" }: ParagraphProps) {
  return <p className={`paragraph ${className}`}>{children}</p>;
}

