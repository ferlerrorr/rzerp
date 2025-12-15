import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { JournalEntryDialog } from "@/components/dialogs/journal-entry-dialog";
import { JournalEntryFormData } from "@/stores/journalEntry";
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

// Journal Entry Data
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

// Account interface for loading from localStorage
interface Account {
  id: string;
  accountType: string;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
  balance: string;
}

// Default journal entries
const defaultJournalEntries: JournalEntry[] = [
  {
    id: "1",
    date: "2024-01-15",
    reference: "JE-001",
    description: "Monthly Sales Revenue",
    debitAccount: "Accounts Receivable",
    creditAccount: "Sales Revenue",
    amount: "₱2,800,000",
    status: "Posted",
  },
  {
    id: "2",
    date: "2024-01-20",
    reference: "JE-002",
    description: "Operating Expenses",
    debitAccount: "Operating Expenses",
    creditAccount: "Cash",
    amount: "₱662,850",
    status: "Posted",
  },
  {
    id: "3",
    date: "2024-01-25",
    reference: "JE-003",
    description: "Inventory Adjustment",
    debitAccount: "Inventory",
    creditAccount: "Cost of Goods Sold",
    amount: "₱150,000",
    status: "Posted",
  },
];

// LocalStorage keys
const JOURNAL_ENTRIES_STORAGE_KEY = "rzerp_journal_entries";
const JOURNAL_ENTRY_COUNTER_KEY = "rzerp_journal_entry_counter";
const ACCOUNTS_STORAGE_KEY = "rzerp_accounts";

// Helper functions for localStorage
const loadJournalEntriesFromStorage = (): JournalEntry[] => {
  try {
    const stored = localStorage.getItem(JOURNAL_ENTRIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default entries if no data exists
    saveJournalEntriesToStorage(defaultJournalEntries);
    // Initialize counter
    if (!localStorage.getItem(JOURNAL_ENTRY_COUNTER_KEY)) {
      localStorage.setItem(JOURNAL_ENTRY_COUNTER_KEY, "3");
    }
    return defaultJournalEntries;
  } catch (error) {
    console.error("Error loading journal entries from localStorage:", error);
    return defaultJournalEntries;
  }
};

const saveJournalEntriesToStorage = (entries: JournalEntry[]) => {
  try {
    localStorage.setItem(JOURNAL_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving journal entries to localStorage:", error);
  }
};

const getNextJournalEntryId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(JOURNAL_ENTRY_COUNTER_KEY) || "3",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(JOURNAL_ENTRY_COUNTER_KEY, nextCounter.toString());
    return `JE-${nextCounter.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error getting next journal entry ID:", error);
    return `JE-${Date.now()}`;
  }
};

// Load accounts from general ledger
const loadAccountsForJournal = (): Account[] => {
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Error loading accounts for journal:", error);
    return [];
  }
};

// Transform JournalEntryFormData to JournalEntry
const transformFormDataToJournalEntry = (
  formData: JournalEntryFormData,
  accounts: Account[]
): JournalEntry => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const debitAccount = accounts.find(
    (acc) => acc.id === formData.debitAccountId
  );
  const creditAccount = accounts.find(
    (acc) => acc.id === formData.creditAccountId
  );
  const amount = parseFloat(formData.amount) || 0;

  return {
    id: getNextJournalEntryId(),
    date: formData.date,
    reference: formData.referenceNumber.trim(),
    description: formData.description.trim(),
    debitAccount: debitAccount?.accountName || "Unknown",
    creditAccount: creditAccount?.accountName || "Unknown",
    amount: formatCurrency(amount),
    status: "Draft", // New entries start as Draft
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
  // Load journal entries from localStorage on mount
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    loadJournalEntriesFromStorage()
  );

  const [isNewJournalEntryOpen, setIsNewJournalEntryOpen] = useState(false);

  // Load accounts for journal entry dialog
  const accounts = useMemo(() => {
    return loadAccountsForJournal();
  }, []);

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
  const handleJournalEntrySubmit = (data: JournalEntryFormData) => {
    try {
      // Transform form data to journal entry format
      const newJournalEntry = transformFormDataToJournalEntry(data, accounts);

      // Add new journal entry to the beginning of the list
      const updatedEntries = [newJournalEntry, ...journalEntries];

      // Save to localStorage
      saveJournalEntriesToStorage(updatedEntries);

      // Update state to trigger re-render
      setJournalEntries(updatedEntries);

      // Show success toast
      toast.success("Journal Entry Created Successfully", {
        description: `Journal entry ${newJournalEntry.reference} has been created.`,
        duration: 3000,
      });

      console.log("Journal entry created successfully:", newJournalEntry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      // Show error toast
      toast.error("Failed to Create Journal Entry", {
        description:
          "An error occurred while creating the journal entry. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle delete journal entry
  const handleDeleteJournalEntry = (entry: JournalEntry) => {
    try {
      const updatedEntries = journalEntries.filter((e) => e.id !== entry.id);
      saveJournalEntriesToStorage(updatedEntries);
      setJournalEntries(updatedEntries);

      toast.success("Journal Entry Deleted", {
        description: `Journal entry ${entry.reference} has been deleted.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Failed to Delete Journal Entry", {
        description: "An error occurred while deleting the journal entry.",
        duration: 4000,
      });
    }
  };

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

      {/* New Journal Entry Dialog */}
      <JournalEntryDialog
        open={isNewJournalEntryOpen}
        onOpenChange={setIsNewJournalEntryOpen}
        title="New Journal Entry"
        onSubmit={handleJournalEntrySubmit}
        accounts={accounts.map((acc) => ({
          id: acc.id,
          code: acc.code,
          accountName: acc.accountName,
          accountType: acc.accountType,
        }))}
      />
    </div>
  );
}
