import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface AppTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabsListClassName?: string;
}

export function AppTabs({
  tabs,
  defaultValue,
  className,
  tabsListClassName,
}: AppTabsProps) {
  const defaultTab = defaultValue || tabs[0]?.value;

  return (
    <Tabs defaultValue={defaultTab} className={cn("w-full", className)}>
      <div
        className="w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0 scrollbar-thin"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <TabsList
          className={cn(
            "inline-flex rounded-3xl h-8 sm:h-10",
            "min-w-max sm:min-w-0 sm:w-auto sm:mx-auto",
            "gap-1 sm:gap-1",
            tabsListClassName || ""
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 rounded-3xl"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-3 sm:mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
