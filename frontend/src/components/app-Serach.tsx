import { Input } from "./ui/input";

export function AppSearch() {
  return (
    <div>
      <Input
        type="text"
        placeholder="Search"
        className="w-full rounded-3xl h-8 text-xs px-3"
      />
    </div>
  );
}
