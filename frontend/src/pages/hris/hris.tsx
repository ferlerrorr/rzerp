import { AppTabs } from "@/components/common/app-Tabs";
import { EmployeesTab } from "./employees";
import { AttendanceTab } from "./attendance";
import { DepartmentTab } from "./department";
import { PositionTab } from "./position";
import { LeaveTab } from "./leave";
import { PayrollTab } from "./payroll";
import { BenefitsTab } from "./benefits";
import { PerformanceTab } from "./performance";

export function HrisPage() {
  const tabs = [
    {
      value: "employees",
      label: "Employees",
      content: <EmployeesTab />,
    },
    {
      value: "attendance",
      label: "Attendance",
      content: <AttendanceTab />,
    },
    {
      value: "department",
      label: "Department",
      content: <DepartmentTab />,
    },
    {
      value: "position",
      label: "Position",
      content: <PositionTab />,
    },
    {
      value: "leave",
      label: "Leave Management",
      content: <LeaveTab />,
    },
    {
      value: "payroll",
      label: "Payroll",
      content: <PayrollTab />,
    },
    {
      value: "benefits",
      label: "Benefits",
      content: <BenefitsTab />,
    },
    {
      value: "performance",
      label: "Performance",
      content: <PerformanceTab />,
    },
  ];

  return (
    <div className="mt-2 sm:mt-4 px-2 sm:px-0">
      <AppTabs
        className="mt-4"
        tabs={tabs}
        defaultValue="employees"
        tabsListClassName="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8"
      />
    </div>
  );
}
