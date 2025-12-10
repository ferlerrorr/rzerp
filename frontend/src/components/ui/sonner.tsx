import { Toaster as Sonner } from "sonner";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast rounded-2xl border border-border bg-background text-foreground shadow-lg",
            "group-[.toaster]:bg-background group-[.toaster]:text-foreground",
            "group-[.toaster]:border-border group-[.toaster]:shadow-lg"
          ),
          description: "group-[.toast]:text-muted-foreground text-sm",
          actionButton:
            "group-[.toast]:bg-primary-gray group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary-gray/90 rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80 rounded-lg",
          success:
            "!bg-white !border-white !text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
          error:
            "!border-white !bg-white !text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
          warning:
            "!border-white !bg-white !text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
          info: "!border-white !bg-white !text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
