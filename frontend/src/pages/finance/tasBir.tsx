import { useState } from "react";
import { SimpleCard } from "@/components/card/simpleCard";
import { BirFormCard } from "@/components/card/birFormCard";
import { IncomeStatement } from "@/components/card/incomeStatement";
import { AppPagination } from "@/components/common/app-Pagination";
import { Receipt, FileText, Calculator, AlertCircle } from "lucide-react";

interface TaxCounts {
  vatPayable: string;
  withholdingTax: string;
  incomeTax: string;
  totalTaxDue: string;
}

interface TaxCardConfig {
  title: string;
  dataKey: keyof TaxCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon:
    | typeof Receipt
    | typeof FileText
    | typeof Calculator
    | typeof AlertCircle;
  iconBgColor:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "gray"
    | "red";
  subtitle: string;
}

const taxCounts: TaxCounts = {
  vatPayable: "₱336,000",
  withholdingTax: "₱168,000",
  incomeTax: "₱378,450",
  totalTaxDue: "₱882,450",
};

const taxCardConfig: TaxCardConfig[] = [
  {
    title: "VAT Payable (12%)",
    dataKey: "vatPayable",
    countColor: "black",
    bgColor: "bg-white",
    icon: Receipt,
    iconBgColor: "blue",
    subtitle: "Value Added Tax",
  },
  {
    title: "Withholding Tax",
    dataKey: "withholdingTax",
    countColor: "black",
    bgColor: "bg-white",
    icon: FileText,
    iconBgColor: "purple",
    subtitle: "EWT & CWT",
  },
  {
    title: "Income Tax",
    dataKey: "incomeTax",
    countColor: "black",
    bgColor: "bg-white",
    icon: Calculator,
    iconBgColor: "indigo",
    subtitle: "Corporate tax",
  },
  {
    title: "Total Tax Due",
    dataKey: "totalTaxDue",
    countColor: "orange",
    bgColor: "bg-white",
    icon: AlertCircle,
    iconBgColor: "orange",
    subtitle: "All taxes",
  },
];

interface BirForm {
  title: string;
  subtitle: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Overdue" | "Approved";
}

const birForms: BirForm[] = [
  {
    title: "BIR Form 2550M - Monthly VAT Declaration",
    subtitle: "December 2024 filing",
    dueDate: "Dec 20, 2024",
    status: "Pending",
  },
  {
    title: "BIR Form 1601E - Monthly Remittance Return",
    subtitle: "December 2024 filing",
    dueDate: "Jan 10, 2025",
    status: "Pending",
  },
  {
    title: "BIR Form 1702Q - Quarterly Income Tax Return",
    subtitle: "Q4 2024 filing",
    dueDate: "Jan 31, 2025",
    status: "Pending",
  },
  {
    title: "BIR Form 1604E - Annual Information Return",
    subtitle: "2024 filing",
    dueDate: "Jan 31, 2025",
    status: "Submitted",
  },
  {
    title: "BIR Form 1701 - Annual Income Tax Return",
    subtitle: "2024 filing",
    dueDate: "Apr 15, 2025",
    status: "Pending",
  },
];

const vatSummaryItems = [
  {
    label: "Output VAT (Sales)",
    amount: "₱336,000",
    isNegative: false,
    isNetIncome: false,
    isSubtotal: false,
  },
  {
    label: "Input VAT (Purchases)",
    amount: "₱142,200",
    isNegative: true,
    isNetIncome: false,
    isSubtotal: false,
  },
  {
    label: "Net VAT Payable",
    amount: "₱193,800",
    isNegative: false,
    isNetIncome: false,
    isSubtotal: true,
  },
];

const withholdingTaxSummaryItems = [
  {
    label: "Expanded Withholding Tax",
    amount: "₱84,000",
    isNegative: false,
    isNetIncome: false,
    isSubtotal: false,
  },
  {
    label: "Creditable Withholding Tax",
    amount: "₱84,000",
    isNegative: false,
    isNetIncome: false,
    isSubtotal: false,
  },
  {
    label: "Total Withheld",
    amount: "₱168,000",
    isNegative: false,
    isNetIncome: false,
    isSubtotal: true,
  },
];

export function TasBirTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(birForms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = birForms.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Tax Management & BIR Compliance
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {taxCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={taxCounts[config.dataKey]}
            subtitle={config.subtitle}
            countColor={config.countColor}
            icon={config.icon}
            iconBgColor={config.iconBgColor}
            className={config.bgColor}
          />
        ))}
      </div>
      <div className="mt-4 border rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          BIR Forms & Deadlines
        </h2>
        <div className="space-y-2">
          {currentForms.map((form, index) => (
            <BirFormCard
              key={startIndex + index}
              title={form.title}
              subtitle={form.subtitle}
              dueDate={form.dueDate}
              status={form.status}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <AppPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="!justify-end"
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <IncomeStatement
          title="VAT Summary"
          items={vatSummaryItems}
          className="bg-white"
        />
        <IncomeStatement
          title="Withholding Tax Summary"
          items={withholdingTaxSummaryItems}
          className="bg-white"
        />
      </div>
    </div>
  );
}
