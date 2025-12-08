import { FormHTMLAttributes, ReactNode } from "react";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export function Form({ children, className = "", ...props }: FormProps) {
  return (
    <form className={`form ${className}`} {...props}>
      {children}
    </form>
  );
}

