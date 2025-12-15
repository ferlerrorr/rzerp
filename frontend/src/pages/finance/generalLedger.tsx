import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef } from "@/components/table/appTable";
import { AddAccountDialog } from "@/components/dialogs/add-account-dialog";
import { AccountFormData, AccountType } from "@/stores/account";
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

// Unified Account interface
interface Account {
  id: string;
  accountType: AccountType;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

// Default account data
const defaultAssetAccounts: Account[] = [
  {
    id: "1",
    accountType: "Asset",
    code: "1001",
    accountName: "Cash and Cash Equivalents",
    debit: "₱500,000",
    credit: "₱0",
    balance: "₱500,000",
  },
  {
    id: "2",
    accountType: "Asset",
    code: "1002",
    accountName: "Accounts Receivable",
    debit: "₱250,000",
    credit: "₱0",
    balance: "₱250,000",
  },
  {
    id: "3",
    accountType: "Asset",
    code: "1003",
    accountName: "Inventory",
    debit: "₱800,000",
    credit: "₱0",
    balance: "₱800,000",
  },
  {
    id: "4",
    accountType: "Asset",
    code: "1004",
    accountName: "Property, Plant & Equipment",
    debit: "₱630,000",
    credit: "₱0",
    balance: "₱630,000",
  },
];

const defaultLiabilityAccounts: Account[] = [
  {
    id: "1",
    accountType: "Liability",
    code: "2001",
    accountName: "Accounts Payable",
    debit: "₱200,000",
    credit: "₱950,000",
    balance: "₱750,000",
  },
];

const defaultEquityAccounts: Account[] = [
  {
    id: "1",
    accountType: "Equity",
    code: "3001",
    accountName: "Capital",
    debit: "₱0",
    credit: "₱1,000,000",
    balance: "₱1,000,000",
  },
];

const defaultRevenueAccounts: Account[] = [
  {
    id: "1",
    accountType: "Revenue",
    code: "4001",
    accountName: "Sales Revenue",
    debit: "₱0",
    credit: "₱2,800,000",
    balance: "₱2,800,000",
  },
];

const defaultExpenseAccounts: Account[] = [
  {
    id: "1",
    accountType: "Expense",
    code: "5001",
    accountName: "Cost of Goods Sold",
    debit: "₱980,000",
    credit: "₱0",
    balance: "₱980,000",
  },
  {
    id: "2",
    accountType: "Expense",
    code: "5002",
    accountName: "Operating Expenses",
    debit: "₱662,850",
    credit: "₱0",
    balance: "₱662,850",
  },
];

const defaultAccounts: Account[] = [
  ...defaultAssetAccounts,
  ...defaultLiabilityAccounts,
  ...defaultEquityAccounts,
  ...defaultRevenueAccounts,
  ...defaultExpenseAccounts,
];

// LocalStorage key
const ACCOUNTS_STORAGE_KEY = "rzerp_accounts";
const ACCOUNT_COUNTER_KEY = "rzerp_account_counter";

// Helper functions for localStorage
const loadAccountsFromStorage = (): Account[] => {
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default accounts if no data exists
    saveAccountsToStorage(defaultAccounts);
    // Initialize counter
    if (!localStorage.getItem(ACCOUNT_COUNTER_KEY)) {
      localStorage.setItem(ACCOUNT_COUNTER_KEY, "7");
    }
    return defaultAccounts;
  } catch (error) {
    console.error("Error loading accounts from localStorage:", error);
    return defaultAccounts;
  }
};

const saveAccountsToStorage = (accounts: Account[]) => {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error("Error saving accounts to localStorage:", error);
  }
};

const getNextAccountId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(ACCOUNT_COUNTER_KEY) || "7",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(ACCOUNT_COUNTER_KEY, nextCounter.toString());
    return nextCounter.toString();
  } catch (error) {
    console.error("Error getting next account ID:", error);
    return Date.now().toString();
  }
};

// Transform AccountFormData to Account
const transformFormDataToAccount = (formData: AccountFormData): Account => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const debit = parseFloat(formData.debit) || 0;
  const credit = parseFloat(formData.credit) || 0;
  // Balance calculation depends on account type
  // Assets/Expenses: Debit - Credit (positive balance)
  // Liabilities/Equity/Revenue: Credit - Debit (positive balance)
  let balance = 0;
  if (formData.accountType === "Asset" || formData.accountType === "Expense") {
    balance = debit - credit;
  } else {
    balance = credit - debit;
  }

  return {
    id: getNextAccountId(),
    accountType: formData.accountType,
    code: formData.code.trim(),
    accountName: formData.accountName.trim(),
    debit: formatCurrency(debit),
    credit: formatCurrency(credit),
    balance: formatCurrency(Math.abs(balance)),
  };
};

// Table column definitions
const accountColumns: ColumnDef<Account>[] = [
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

// Helper function to calculate totals for footer
const calculateTotals = (accounts: Account[]) => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[₱,]/g, "")) || 0;
  };

  const totalDebit = accounts.reduce(
    (sum, acc) => sum + parseCurrency(acc.debit),
    0
  );
  const totalCredit = accounts.reduce(
    (sum, acc) => sum + parseCurrency(acc.credit),
    0
  );
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseCurrency(acc.balance),
    0
  );

  return {
    debit: formatCurrency(totalDebit),
    credit: formatCurrency(totalCredit),
    balance: formatCurrency(totalBalance),
  };
};

export function GeneralLedgerTab() {
  // Load accounts from localStorage on mount
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadAccountsFromStorage()
  );

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Filter accounts by type
  const assetAccounts = useMemo(
    () => accounts.filter((acc) => acc.accountType === "Asset"),
    [accounts]
  );
  const liabilityAccounts = useMemo(
    () => accounts.filter((acc) => acc.accountType === "Liability"),
    [accounts]
  );
  const equityAccounts = useMemo(
    () => accounts.filter((acc) => acc.accountType === "Equity"),
    [accounts]
  );
  const revenueAccounts = useMemo(
    () => accounts.filter((acc) => acc.accountType === "Revenue"),
    [accounts]
  );
  const expenseAccounts = useMemo(
    () => accounts.filter((acc) => acc.accountType === "Expense"),
    [accounts]
  );

  // Calculate counts for cards
  const generalLedgerCounts = useMemo(() => {
    return {
      assets: assetAccounts.length.toString(),
      liabilities: liabilityAccounts.length.toString(),
      equity: equityAccounts.length.toString(),
      revenue: revenueAccounts.length.toString(),
      expenses: expenseAccounts.length.toString(),
    };
  }, [
    assetAccounts,
    liabilityAccounts,
    equityAccounts,
    revenueAccounts,
    expenseAccounts,
  ]);

  // Calculate totals for footers
  const assetTotals = useMemo(
    () => calculateTotals(assetAccounts),
    [assetAccounts]
  );
  const liabilityTotals = useMemo(
    () => calculateTotals(liabilityAccounts),
    [liabilityAccounts]
  );
  const equityTotals = useMemo(
    () => calculateTotals(equityAccounts),
    [equityAccounts]
  );
  const revenueTotals = useMemo(
    () => calculateTotals(revenueAccounts),
    [revenueAccounts]
  );
  const expenseTotals = useMemo(
    () => calculateTotals(expenseAccounts),
    [expenseAccounts]
  );

  // Handle account submission
  const handleAccountSubmit = (data: AccountFormData) => {
    try {
      // Transform form data to account format
      const newAccount = transformFormDataToAccount(data);

      // Add new account to the list
      const updatedAccounts = [newAccount, ...accounts];

      // Save to localStorage
      saveAccountsToStorage(updatedAccounts);

      // Update state to trigger re-render
      setAccounts(updatedAccounts);

      // Show success toast
      toast.success("Account Added Successfully", {
        description: `${data.accountName} has been added to ${data.accountType} accounts.`,
        duration: 3000,
      });

      console.log("Account added successfully:", newAccount);
    } catch (error) {
      console.error("Error adding account:", error);
      // Show error toast
      toast.error("Failed to Add Account", {
        description:
          "An error occurred while adding the account. Please try again.",
        duration: 4000,
      });
    }
  };

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
          onAddAccountClick={() => setIsAddAccountOpen(true)}
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
              "",
              "Total Asset",
              assetTotals.debit,
              assetTotals.credit,
              assetTotals.balance,
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
              "",
              "Total Liability",
              liabilityTotals.debit,
              liabilityTotals.credit,
              liabilityTotals.balance,
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
              "",
              "Total Equity",
              equityTotals.debit,
              equityTotals.credit,
              equityTotals.balance,
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
              "",
              "Total Revenue",
              revenueTotals.debit,
              revenueTotals.credit,
              revenueTotals.balance,
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
              "",
              "Total Expense",
              expenseTotals.debit,
              expenseTotals.credit,
              expenseTotals.balance,
            ],
          }}
        />
      </div>

      {/* Add Account Dialog */}
      <AddAccountDialog
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
        title="Add Account"
        onSubmit={handleAccountSubmit}
      />
    </div>
  );
}
