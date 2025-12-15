"use client";

import { ReactNode, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTabsStore } from "@/stores/tabs";

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
  const { activeTab, setActiveTab } = useTabsStore();
  const defaultTab = defaultValue || tabs[0]?.value;

  // Check if current activeTab exists in current page's tabs
  const tabValues = tabs.map((tab) => tab.value);
  const isValidTab = activeTab && tabValues.includes(activeTab);
  const effectiveTab = isValidTab ? activeTab : defaultTab;

  // Sync store with default value when tab doesn't exist or is empty
  useEffect(() => {
    if (!isValidTab && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isValidTab, setActiveTab]);

  return (
    <Tabs
      value={effectiveTab}
      onValueChange={setActiveTab}
      className={cn("w-full", className)}
    >
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
