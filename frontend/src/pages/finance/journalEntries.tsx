import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { JournalEntryDialog } from "@/components/dialogs/journal-entry-dialog";
import {
  useJournalEntryStore,
  JournalEntryFromAPI,
} from "@/stores/journalEntry";
import { useAccountStore } from "@/stores/account";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface JournalEntriesCounts {
  totalEntries: string;
  posted: string;
  draft: string;
}

interface JournalEntriesCardConfig {
  title: string;
  dataKey: keyof JournalEntriesCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon: typeof FileText | typeof CheckCircle2 | typeof FileEdit;
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

// Journal Entry Data for display
interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: string;
  status: "Posted" | "Draft";
}

// Transform API journal entry to display format
const transformApiJournalEntryToJournalEntry = (
  apiEntry: JournalEntryFromAPI
): JournalEntry => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const amount = parseFloat(apiEntry.amount) || 0;

  return {
    id: apiEntry.id.toString(),
    date: apiEntry.date,
    reference: apiEntry.reference_number,
    description: apiEntry.description,
    debitAccount: apiEntry.debit_account.account_name,
    creditAccount: apiEntry.credit_account.account_name,
    amount: formatCurrency(amount),
    status: apiEntry.status,
  };
};

const journalEntriesCardConfig: JournalEntriesCardConfig[] = [
  {
    title: "Total Entries",
    dataKey: "totalEntries",
    countColor: "black",
    bgColor: "bg-white",
    icon: FileText,
    iconBgColor: "blue",
  },
  {
    title: "Posted",
    dataKey: "posted",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle2,
    iconBgColor: "green",
  },
  {
    title: "Draft",
    dataKey: "draft",
    countColor: "orange",
    bgColor: "bg-white",
    icon: FileEdit,
    iconBgColor: "orange",
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
  <div className="w-full">
    <div className="space-y-4 pb-2">
      <div className="w-full -mx-2 sm:mx-0">
        <div
          className="overflow-x-auto px-2 sm:px-0 scrollbar-thin"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="sm:min-w-0" style={{ minWidth: "min(100%, 1000px)" }}>
            <div style={{ minWidth: "1000px" }}>
              <div className="w-full border border-[#EFEFEF] rounded-2xl overflow-hidden bg-white">
                {/* Table Header */}
                <div className="bg-[#F4F4F5] border-b border-[#EFEFEF] rounded-t-2xl">
                  <div className="flex h-12">
                    <Skeleton className="h-6 w-24 m-3" />
                    <Skeleton className="h-6 w-28 m-3" />
                    <Skeleton className="h-6 w-40 m-3" />
                    <Skeleton className="h-6 w-32 m-3" />
                    <Skeleton className="h-6 w-32 m-3" />
                    <Skeleton className="h-6 w-28 m-3" />
                    <Skeleton className="h-6 w-24 m-3" />
                    <Skeleton className="h-6 w-20 m-3" />
                  </div>
                </div>
                {/* Table Rows */}
                <div className="divide-y divide-[#EFEFEF]">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex h-16 items-center">
                      <Skeleton className="h-4 w-24 mx-4" />
                      <Skeleton className="h-4 w-28 mx-4" />
                      <Skeleton className="h-4 w-40 mx-4" />
                      <Skeleton className="h-4 w-32 mx-4" />
                      <Skeleton className="h-4 w-32 mx-4" />
                      <Skeleton className="h-4 w-28 mx-4" />
                      <Skeleton className="h-4 w-24 mx-4" />
                      <Skeleton className="h-4 w-20 mx-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Table column definitions
const journalEntryColumns: ColumnDef<JournalEntry>[] = [
  {
    header: "Date",
    accessor: "date",
    width: "120px",
  },
  {
    header: "Reference",
    accessor: "reference",
    className: "font-medium",
    width: "100px",
  },
  {
    header: "Description",
    accessor: "description",
  },
  {
    header: "Debit Account",
    accessor: "debitAccount",
  },
  {
    header: "Credit Account",
    accessor: "creditAccount",
  },
  {
    header: "Amount",
    accessor: "amount",
    className: "font-semibold",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Posted: "success",
      Draft: "warning",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

export function JournalEntriesTab() {
  const {
    journalEntries: apiJournalEntries,
    loading,
    error,
    fetchJournalEntries,
    deleteJournalEntry,
  } = useJournalEntryStore();

  const {
    accounts: apiAccounts,
    fetchAccounts,
  } = useAccountStore();

  const [isNewJournalEntryOpen, setIsNewJournalEntryOpen] = useState(false);

  // Fetch journal entries and accounts on mount
  useEffect(() => {
    // Set high per_page to get all accounts
    const { setFilters: setAccountFilters } = useAccountStore.getState();
    setAccountFilters({ per_page: 1000 });
    fetchAccounts();
    
    // Set high per_page to get all journal entries
    const { setFilters: setJournalFilters } = useJournalEntryStore.getState();
    setJournalFilters({ per_page: 1000 });
    fetchJournalEntries();
  }, [fetchJournalEntries, fetchAccounts]);

  // Transform API journal entries to display format
  const journalEntries = useMemo(() => {
    return apiJournalEntries.map(transformApiJournalEntryToJournalEntry);
  }, [apiJournalEntries]);

  // Transform API accounts for dialog
  const accounts = useMemo(() => {
    return apiAccounts.map((acc) => ({
      id: acc.id.toString(),
      code: acc.code,
      accountName: acc.account_name,
      accountType: acc.account_type,
    }));
  }, [apiAccounts]);

  // Calculate counts for cards
  const journalEntriesCounts = useMemo(() => {
    const totalEntries = journalEntries.length;
    const posted = journalEntries.filter(
      (entry) => entry.status === "Posted"
    ).length;
    const draft = journalEntries.filter(
      (entry) => entry.status === "Draft"
    ).length;

    return {
      totalEntries: totalEntries.toString(),
      posted: posted.toString(),
      draft: draft.toString(),
    };
  }, [journalEntries]);

  // Handle journal entry submission
  const handleJournalEntrySubmit = async (_data?: unknown) => {
    // The dialog already handles the API call via the store
    // Just refresh the journal entries list
    await fetchJournalEntries();
  };

  // Handle delete journal entry
  const handleDeleteJournalEntry = async (entry: JournalEntry) => {
    const result = await deleteJournalEntry(parseInt(entry.id));
    if (result) {
      toast.success("Journal Entry Deleted", {
        description: `Journal entry ${entry.reference} has been deleted.`,
        duration: 3000,
      });
    } else {
      toast.error("Failed to Delete Journal Entry", {
        description: "An error occurred while deleting the journal entry.",
        duration: 4000,
      });
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Journal Entries", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

  // Update actions with delete handler
  const journalEntryActions = useMemo<ActionItem<JournalEntry>[]>(
    () => [
      {
        label: "View",
        icon: Eye,
        onClick: (entry) => {
          console.log("View entry:", entry);
        },
      },
      {
        label: "Edit",
        icon: Edit,
        onClick: (entry) => {
          console.log("Edit entry:", entry);
        },
      },
      {
        label: "Delete",
        icon: Trash2,
        onClick: handleDeleteJournalEntry,
        variant: "destructive",
      },
    ],
    [handleDeleteJournalEntry]
  );

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Journal Entries
        </h1>
        <AppButtons
          filter={false}
          add={false}
          filterOrder={1}
          addOrder={2}
          newJournalEntry={true}
          newJournalEntryOrder={3}
          onNewJournalEntryClick={() => setIsNewJournalEntryOpen(true)}
        />
      </div>
      
      {loading && journalEntries.length === 0 ? (
        <>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          {/* Skeleton Table */}
          <TableSkeleton />
        </>
      ) : (
        <>
          {!loading && journalEntries.length === 0 && !error && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">No journal entries found. Create your first journal entry to get started.</p>
            </div>
          )}

          {journalEntries.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
                {journalEntriesCardConfig.map((card) => (
                  <SimpleCard
                    key={card.dataKey}
                    title={card.title}
                    count={journalEntriesCounts[card.dataKey]}
                    countColor={card.countColor}
                    icon={card.icon}
                    iconBgColor={card.iconBgColor}
                    className={card.bgColor}
                  />
                ))}
              </div>
              <div className="w-full">
                <AppTable
                  data={journalEntries}
                  columns={journalEntryColumns}
                  actions={journalEntryActions}
                  itemsPerPage={5}
                  minWidth="1000px"
                  getRowId={(row) => row.id}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* New Journal Entry Dialog */}
      <JournalEntryDialog
        open={isNewJournalEntryOpen}
        onOpenChange={setIsNewJournalEntryOpen}
        title="New Journal Entry"
        onSubmit={handleJournalEntrySubmit}
        accounts={accounts}
      />
    </div>
  );
}
