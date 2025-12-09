import { SimpleCard } from "@/components/card/simpleCard";
import { PerformanceReviewCard } from "@/components/card/performanceReviewCard";

interface PerformanceData {
  avg_performance_score: string;
  pending_reviews: number;
  top_performers: number;
  training_hours: number;
}

interface PerformanceCardConfig {
  title: string;
  dataKey: keyof PerformanceData;
  subtitle: string;
  countColor: "default" | "green" | "blue" | "black" | "orange";
}

// Sample data - This would typically come from an API/database
const performanceData: PerformanceData = {
  avg_performance_score: "4.2/5.0",
  pending_reviews: 15,
  top_performers: 23,
  training_hours: 1840,
};

// Card configuration - maps to dummy data
const performanceCardConfig: PerformanceCardConfig[] = [
  {
    title: "Avg Performance Score",
    dataKey: "avg_performance_score",
    subtitle: "Company average",
    countColor: "black",
  },
  {
    title: "Pending Reviews",
    dataKey: "pending_reviews",
    subtitle: "Due this month",
    countColor: "orange",
  },
  {
    title: "Top Performers",
    dataKey: "top_performers",
    subtitle: "Score >= 4.5",
    countColor: "green",
  },
  {
    title: "Training Hours",
    dataKey: "training_hours",
    subtitle: "This quarter",
    countColor: "blue",
  },
];

// Performance Review Data
interface PerformanceReview {
  id: string;
  employeeName: string;
  reviewPeriod: string;
  department: string;
  role: string;
  rating: number;
  ratingText: string;
  avatarUrl?: string;
}

// Sample performance review data - This would typically come from an API/database
const performanceReviews: PerformanceReview[] = [
  {
    id: "PR001",
    employeeName: "Juan Dela Cruz",
    reviewPeriod: "Q4 2024 Review",
    department: "IT Department",
    role: "Senior Developer",
    rating: 4.8,
    ratingText: "Excellent",
  },
  {
    id: "PR002",
    employeeName: "Maria Santos",
    reviewPeriod: "Q4 2024 Review",
    department: "Marketing",
    role: "Manager",
    rating: 4.6,
    ratingText: "Excellent",
  },
  {
    id: "PR003",
    employeeName: "Pedro Reyes",
    reviewPeriod: "Q4 2024 Review",
    department: "HR",
    role: "Specialist",
    rating: 4.2,
    ratingText: "Good",
  },
];

export function PerformanceTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Performance Management
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {performanceCardConfig.map((card) => (
          <SimpleCard
            key={card.dataKey}
            title={card.title}
            count={performanceData[card.dataKey]}
            subtitle={card.subtitle}
            countColor={card.countColor}
          />
        ))}
      </div>
      <div className="w-full rounded-3xl p-4 border border-gray-200">
        <h1 className="text-lg font-semibold mb-4">
          Recent Performance Reviews
        </h1>
        <div className="flex flex-col gap-3">
          {performanceReviews.map((review) => (
            <PerformanceReviewCard
              key={review.id}
              employeeName={review.employeeName}
              reviewPeriod={review.reviewPeriod}
              department={review.department}
              role={review.role}
              rating={review.rating}
              ratingText={review.ratingText}
              avatarUrl={review.avatarUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
