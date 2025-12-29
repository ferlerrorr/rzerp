import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef } from "@/components/table/appTable";
import { AddAccountDialog } from "@/components/dialogs/add-account-dialog";
import { AccountType, useAccountStore, AccountFromAPI } from "@/stores/account";
import { Skeleton } from "@/components/ui/skeleton";
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
    countColor: "default",
    bgColor: "bg-white",
    icon: Building2,
    iconBgColor: "gray",
  },
  {
    title: "Liabilities",
    dataKey: "liabilities",
    countColor: "default",
    bgColor: "bg-white",
    icon: FileText,
    iconBgColor: "gray",
  },
  {
    title: "Equity",
    dataKey: "equity",
    countColor: "default",
    bgColor: "bg-white",
    icon: TrendingUp,
    iconBgColor: "gray",
  },
  {
    title: "Revenue",
    dataKey: "revenue",
    countColor: "default",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "gray",
  },
  {
    title: "Expenses",
    dataKey: "expenses",
    countColor: "default",
    bgColor: "bg-white",
    icon: ArrowDownLeft,
    iconBgColor: "gray",
  },
];

// Unified Account interface for display
interface Account {
  id: string;
  accountType: AccountType;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

// Transform API account to display account
const transformApiAccountToAccount = (apiAccount: AccountFromAPI): Account => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const debit = parseFloat(apiAccount.debit) || 0;
  const credit = parseFloat(apiAccount.credit) || 0;
  
  // Balance calculation depends on account type
  // Assets/Expenses: Debit - Credit (positive balance)
  // Liabilities/Equity/Revenue: Credit - Debit (positive balance)
  let balance = 0;
  if (apiAccount.account_type === "Asset" || apiAccount.account_type === "Expense") {
    balance = debit - credit;
  } else {
    balance = credit - debit;
  }

  return {
    id: apiAccount.id.toString(),
    accountType: apiAccount.account_type,
    code: apiAccount.code,
    accountName: apiAccount.account_name,
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

// Skeleton Components
const CardSkeleton = () => (
  <div className="w-auto p-4 rounded-2xl border border-[#EFEFEF] bg-white flex flex-col gap-2">
    <div className="flex flex-row items-center justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-11 w-11 rounded-full" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);

const TableSkeleton = () => (
  <div className="w-full border border-gray-200 rounded-3xl p-4">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-4 pb-2">
      <div className="w-full -mx-2 sm:mx-0">
        <div
          className="overflow-x-auto px-2 sm:px-0 scrollbar-thin"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="sm:min-w-0" style={{ minWidth: "min(100%, 800px)" }}>
            <div style={{ minWidth: "800px" }}>
              <div className="w-full border border-[#EFEFEF] rounded-2xl overflow-hidden bg-white">
                {/* Table Header */}
                <div className="bg-[#F4F4F5] border-b border-[#EFEFEF] rounded-t-2xl">
                  <div className="flex h-12">
                    <Skeleton className="h-6 w-20 m-3" />
                    <Skeleton className="h-6 w-32 m-3" />
                    <Skeleton className="h-6 w-24 m-3" />
                    <Skeleton className="h-6 w-24 m-3" />
                    <Skeleton className="h-6 w-24 m-3" />
                  </div>
                </div>
                {/* Table Rows */}
                <div className="divide-y divide-[#EFEFEF]">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex h-16 items-center">
                      <Skeleton className="h-4 w-20 mx-4" />
                      <Skeleton className="h-4 w-32 mx-4" />
                      <Skeleton className="h-4 w-24 mx-4" />
                      <Skeleton className="h-4 w-24 mx-4" />
                      <Skeleton className="h-4 w-24 mx-4" />
                    </div>
                  ))}
                </div>
                {/* Table Footer */}
                <div className="bg-[#F4F4F5] border-t border-[#EFEFEF] rounded-b-2xl">
                  <div className="flex h-16 items-center">
                    <Skeleton className="h-4 w-20 mx-4" />
                    <Skeleton className="h-4 w-32 mx-4" />
                    <Skeleton className="h-4 w-24 mx-4" />
                    <Skeleton className="h-4 w-24 mx-4" />
                    <Skeleton className="h-4 w-24 mx-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
  const {
    accounts: apiAccounts,
    loading,
    error,
    fetchAccounts,
  } = useAccountStore();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Fetch accounts on mount - set high per_page to get all accounts
  useEffect(() => {
    const { setFilters } = useAccountStore.getState();
    setFilters({ per_page: 1000 }); // Get all accounts
    fetchAccounts();
  }, [fetchAccounts]);

  // Transform API accounts to display format
  const accounts = useMemo(() => {
    return apiAccounts.map(transformApiAccountToAccount);
  }, [apiAccounts]);

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

  // Handle account submission - refresh from API after creation
  const handleAccountSubmit = async (_data?: unknown) => {
    // The dialog already handles the API call via the store
    // Just refresh the accounts list to get the new account
    await fetchAccounts();
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Accounts", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

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
      
      {loading && accounts.length === 0 ? (
        <>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          {/* Skeleton Tables */}
          <TableSkeleton />
          <TableSkeleton />
          <TableSkeleton />
          <TableSkeleton />
          <TableSkeleton />
        </>
      ) : (
        <>
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
              footer={
                assetAccounts.length > 0
                  ? {
                      cells: [
                        "",
                        "Total Asset",
                        assetTotals.debit,
                        assetTotals.credit,
                        assetTotals.balance,
                      ],
                    }
                  : undefined
              }
            />
            {assetAccounts.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No accounts</p>
              </div>
            )}
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
              footer={
                liabilityAccounts.length > 0
                  ? {
                      cells: [
                        "",
                        "Total Liability",
                        liabilityTotals.debit,
                        liabilityTotals.credit,
                        liabilityTotals.balance,
                      ],
                    }
                  : undefined
              }
            />
            {liabilityAccounts.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No accounts</p>
              </div>
            )}
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
              footer={
                equityAccounts.length > 0
                  ? {
                      cells: [
                        "",
                        "Total Equity",
                        equityTotals.debit,
                        equityTotals.credit,
                        equityTotals.balance,
                      ],
                    }
                  : undefined
              }
            />
            {equityAccounts.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No accounts</p>
              </div>
            )}
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
              footer={
                revenueAccounts.length > 0
                  ? {
                      cells: [
                        "",
                        "Total Revenue",
                        revenueTotals.debit,
                        revenueTotals.credit,
                        revenueTotals.balance,
                      ],
                    }
                  : undefined
              }
            />
            {revenueAccounts.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No accounts</p>
              </div>
            )}
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
              footer={
                expenseAccounts.length > 0
                  ? {
                      cells: [
                        "",
                        "Total Expense",
                        expenseTotals.debit,
                        expenseTotals.credit,
                        expenseTotals.balance,
                      ],
                    }
                  : undefined
              }
            />
            {expenseAccounts.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No accounts</p>
              </div>
            )}
          </div>
        </>
      )}

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
