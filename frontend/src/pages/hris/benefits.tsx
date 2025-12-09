import { SimpleCard } from "@/components/card/simpleCard";
import { BenefitCard } from "@/components/card/benefitCard";

interface BenefitsData {
  total_benefits_budget: string;
  hmo_enrolled: number;
  life_insurance: number;
}

interface BenefitsCardConfig {
  title: string;
  dataKey: keyof BenefitsData;
  subtitle: string;
  countColor: "default" | "green" | "blue" | "black" | "orange";
}

// Sample data - This would typically come from an API/database
const benefitsData: BenefitsData = {
  total_benefits_budget: "₱1,850,000",
  hmo_enrolled: 127,
  life_insurance: 127,
};

// Card configuration - maps to dummy data
const benefitsCardConfig: BenefitsCardConfig[] = [
  {
    title: "Total Benefits Budget",
    dataKey: "total_benefits_budget",
    subtitle: "Annual allocation",
    countColor: "black",
  },
  {
    title: "HMO Enrolled",
    dataKey: "hmo_enrolled",
    subtitle: "100% coverage",
    countColor: "blue",
  },
  {
    title: "Life Insurance",
    dataKey: "life_insurance",
    subtitle: "All employees covered",
    countColor: "green",
  },
];

// Management Benefits Data
interface ManagementBenefit {
  id: string;
  title: string;
  description: string;
  status: string;
}

// Sample management benefits data - This would typically come from an API/database
const managementBenefits: ManagementBenefit[] = [
  {
    id: "MB001",
    title: "SSS (Social Security System)",
    description: "Mandatory government benefit",
    status: "Active",
  },
  {
    id: "MB002",
    title: "PhilHealth",
    description: "National health insurance",
    status: "Active",
  },
  {
    id: "MB003",
    title: "Pag-IBIG Fund",
    description: "Home development fund",
    status: "Active",
  },
  {
    id: "MB004",
    title: "13th Month Pay",
    description: "Required by Philippine law",
    status: "Active",
  },
];

// Company Benefits Data
interface CompanyBenefit {
  id: string;
  title: string;
  description: string;
  status: string;
  statusVariant:
    | "success"
    | "warning"
    | "error"
    | "info"
    | "pending"
    | "default";
}

// Sample company benefits data - This would typically come from an API/database
const companyBenefits: CompanyBenefit[] = [
  {
    id: "CB001",
    title: "HMO Health Card",
    description: "₱150,000 annual limit",
    status: "Premium",
    statusVariant: "info",
  },
  {
    id: "CB002",
    title: "Life Insurance",
    description: "₱500,000 coverage",
    status: "Premium",
    statusVariant: "info",
  },
  {
    id: "CB003",
    title: "Rice Allowance",
    description: "₱2,000 per month",
    status: "Active",
    statusVariant: "success",
  },
  {
    id: "CB004",
    title: "Transportation Allowance",
    description: "₱3,000 per month",
    status: "Active",
    statusVariant: "success",
  },
];

export function BenefitsTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Benefits Management
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
        {benefitsCardConfig.map((card) => (
          <SimpleCard
            key={card.dataKey}
            title={card.title}
            count={benefitsData[card.dataKey]}
            subtitle={card.subtitle}
            countColor={card.countColor}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="w-full rounded-3xl p-4 border border-gray-200">
          <h1 className="text-base font-semibold mb-4">Management Benefits</h1>
          <div className="flex flex-col gap-3">
            {managementBenefits.map((benefit) => (
              <BenefitCard
                key={benefit.id}
                title={benefit.title}
                description={benefit.description}
                status={benefit.status}
                statusVariant="success"
              />
            ))}
          </div>
        </div>
        <div className="w-full rounded-3xl p-4 border border-gray-200">
          <h1 className="text-base text-gray-700 font-semibold mb-4">
            Company Benefits
          </h1>
          <div className="flex flex-col gap-3">
            {companyBenefits.map((benefit) => (
              <BenefitCard
                key={benefit.id}
                title={benefit.title}
                description={benefit.description}
                status={benefit.status}
                statusVariant={benefit.statusVariant}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
