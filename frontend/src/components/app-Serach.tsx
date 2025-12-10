"use client";

import { Input } from "./ui/input";
import { useSearchStore } from "@/stores/search";

export function AppSearch() {
  const { query, setQuery } = useSearchStore();

  return (
    <div>
      <Input
        type="text"
        placeholder="Search"
        className="w-full rounded-3xl h-8 text-xs px-3"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
