import { AppButtons } from "@/components/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef } from "@/components/table/appTable";
import {
  Building2,
  FileText,
  TrendingUp,
  DollarSign,
  ArrowDownLeft,
} from "lucide-react";

interface GeneralLedgerCounts {
  assets: string;
  liabilities: string;
  equity: string;
  revenue: string;
  expenses: string;
}

interface GeneralLedgerCardConfig {
  title: string;
  dataKey: keyof GeneralLedgerCounts;
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
    | typeof Building2
    | typeof FileText
    | typeof TrendingUp
    | typeof DollarSign
    | typeof ArrowDownLeft;
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
}

const generalLedgerCounts: GeneralLedgerCounts = {
  assets: "4",
  liabilities: "2",
  equity: "1",
  revenue: "2",
  expenses: "4",
};

const generalLedgerCardConfig: GeneralLedgerCardConfig[] = [
  {
    title: "Assets",
    dataKey: "assets",
    countColor: "blue",
    bgColor: "bg-white",
    icon: Building2,
    iconBgColor: "blue",
  },
  {
    title: "Liabilities",
    dataKey: "liabilities",
    countColor: "orange",
    bgColor: "bg-white",
    icon: FileText,
    iconBgColor: "orange",
  },
  {
    title: "Equity",
    dataKey: "equity",
    countColor: "purple",
    bgColor: "bg-white",
    icon: TrendingUp,
    iconBgColor: "purple",
  },
  {
    title: "Revenue",
    dataKey: "revenue",
    countColor: "green",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "green",
  },
  {
    title: "Expenses",
    dataKey: "expenses",
    countColor: "red",
    bgColor: "bg-white",
    icon: ArrowDownLeft,
    iconBgColor: "red",
  },
];

// Asset Account Data
interface AssetAccount {
  id: string;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

const assetAccounts: AssetAccount[] = [
  {
    id: "1",
    code: "1001",
    accountName: "Cash and Cash Equivalents",
    debit: "₱500,000",
    credit: "₱0",
    balance: "₱500,000",
  },
  {
    id: "2",
    code: "1002",
    accountName: "Accounts Receivable",
    debit: "₱250,000",
    credit: "₱0",
    balance: "₱250,000",
  },
  {
    id: "3",
    code: "1003",
    accountName: "Inventory",
    debit: "₱800,000",
    credit: "₱0",
    balance: "₱800,000",
  },
  {
    id: "4",
    code: "1004",
    accountName: "Property, Plant & Equipment",
    debit: "₱630,000",
    credit: "₱0",
    balance: "₱630,000",
  },
];

// Liability Account Data
interface LiabilityAccount {
  id: string;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

const liabilityAccounts: LiabilityAccount[] = [
  {
    id: "1",
    code: "2001",
    accountName: "Accounts Payable",
    debit: "₱200,000",
    credit: "₱950,000",
    balance: "₱750,000",
  },
];

// Equity Account Data
interface EquityAccount {
  id: string;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

const equityAccounts: EquityAccount[] = [
  {
    id: "1",
    code: "3001",
    accountName: "Capital",
    debit: "₱0",
    credit: "₱1,000,000",
    balance: "₱1,000,000",
  },
];

// Revenue Account Data
interface RevenueAccount {
  id: string;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

const revenueAccounts: RevenueAccount[] = [
  {
    id: "1",
    code: "4001",
    accountName: "Sales Revenue",
    debit: "₱0",
    credit: "₱2,800,000",
    balance: "₱2,800,000",
  },
];

// Expense Account Data
interface ExpenseAccount {
  id: string;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

const expenseAccounts: ExpenseAccount[] = [
  {
    id: "1",
    code: "5001",
    accountName: "Cost of Goods Sold",
    debit: "₱980,000",
    credit: "₱0",
    balance: "₱980,000",
  },
  {
    id: "2",
    code: "5002",
    accountName: "Operating Expenses",
    debit: "₱662,850",
    credit: "₱0",
    balance: "₱662,850",
  },
];

// Table column definitions (shared across all account types)
const accountColumns: ColumnDef<
  | AssetAccount
  | LiabilityAccount
  | EquityAccount
  | RevenueAccount
  | ExpenseAccount
>[] = [
  {
    header: "Code",
    accessor: "code",
    width: "100px",
    className: "font-medium",
  },
  {
    header: "Account Name",
    accessor: "accountName",
  },
  {
    header: "Debit",
    accessor: "debit",
  },
  {
    header: "Credit",
    accessor: "credit",
  },
  {
    header: "Balance",
    accessor: "balance",
    className: "font-semibold",
  },
];

export function GeneralLedgerTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          General Ledger
        </h1>
        <AppButtons
          filter={false}
          add={false}
          addAccount={true}
          addInvoice={false}
          filterOrder={1}
          filterLabel="Filter"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {generalLedgerCardConfig.map((card) => (
          <SimpleCard
            key={card.dataKey}
            title={card.title}
            count={generalLedgerCounts[card.dataKey]}
            countColor={card.countColor}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            className={card.bgColor}
          />
        ))}
      </div>
      <div className="w-full border border-gray-200 rounded-3xl p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Asset Accounts
        </h2>
        <AppTable
          data={assetAccounts}
          columns={accountColumns}
          itemsPerPage={5}
          minWidth="800px"
          getRowId={(row) => row.id}
          footer={{
            cells: [
              "", // Code column - empty
              "Total Asset", // Account Name - starts at beginning
              "₱3,895,000", // Debit
              "₱1,715,000", // Credit
              "₱2,180,000", // Balance
            ],
          }}
        />
      </div>
      <div className="w-full border border-gray-200 rounded-3xl p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Liability Accounts
        </h2>
        <AppTable
          data={liabilityAccounts}
          columns={accountColumns}
          itemsPerPage={5}
          minWidth="800px"
          getRowId={(row) => row.id}
          footer={{
            cells: [
              "", // Code column - empty
              "Total Liability", // Account Name - starts at beginning
              "₱200,000", // Debit
              "₱950,000", // Credit
              "₱750,000", // Balance
            ],
          }}
        />
      </div>
      <div className="w-full border border-gray-200 rounded-3xl p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Equity Accounts
        </h2>
        <AppTable
          data={equityAccounts}
          columns={accountColumns}
          itemsPerPage={5}
          minWidth="800px"
          getRowId={(row) => row.id}
          footer={{
            cells: [
              "", // Code column - empty
              "Total Equity", // Account Name - starts at beginning
              "₱0", // Debit
              "₱1,000,000", // Credit
              "₱1,000,000", // Balance
            ],
          }}
        />
      </div>
      <div className="w-full border border-gray-200 rounded-3xl p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Revenue Accounts
        </h2>
        <AppTable
          data={revenueAccounts}
          columns={accountColumns}
          itemsPerPage={5}
          minWidth="800px"
          getRowId={(row) => row.id}
          footer={{
            cells: [
              "", // Code column - empty
              "Total Revenue", // Account Name - starts at beginning
              "₱0", // Debit
              "₱2,800,000", // Credit
              "₱2,800,000", // Balance
            ],
          }}
        />
      </div>
      <div className="w-full border border-gray-200 rounded-3xl p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Expense Accounts
        </h2>
        <AppTable
          data={expenseAccounts}
          columns={accountColumns}
          itemsPerPage={5}
          minWidth="800px"
          getRowId={(row) => row.id}
          footer={{
            cells: [
              "", // Code column - empty
              "Total Expense", // Account Name - starts at beginning
              "₱1,642,850", // Debit
              "₱0", // Credit
              "₱1,642,850", // Balance
            ],
          }}
        />
      </div>
    </div>
  );
}
