import { AppButtons } from "@/components/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
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

const journalEntriesCounts: JournalEntriesCounts = {
  totalEntries: "3",
  posted: "3",
  draft: "0",
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

const journalEntries: JournalEntry[] = [
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

// Table action items
const journalEntryActions: ActionItem<JournalEntry>[] = [
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
    onClick: (entry) => {
      console.log("Delete entry:", entry);
    },
    variant: "destructive",
  },
];

export function JournalEntriesTab() {
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
    </div>
  );
}
