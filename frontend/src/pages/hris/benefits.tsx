import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";

export function BenefitsTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center max-w-[30rem]">
        <div className="w-full">
          <AppSearch />
        </div>
        <AppButtons />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
    </div>
  );
}
