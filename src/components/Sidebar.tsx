import React from "react";
import { motion } from "framer-motion";
import {
  TableIcon,
  InfoIcon,
  SigmaIcon,
  CircleSlashIcon,
  CopyIcon,
  AlertTriangleIcon,
  ActivityIcon,
  ColumnsIcon,
  GitCompareIcon,
  BarChart3Icon,
  FileCheck2Icon,
  WandSparklesIcon,
  DownloadIcon,
  XIcon,
} from "lucide-react";
import type { DatasetAnalysis, ModuleId } from "../types";

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  badge?: (a: DatasetAnalysis) => { count: number; tone: "red" | "amber" } | null;
}

const NAV: NavItem[] = [
  { id: "preview", label: "Preview", icon: TableIcon, group: "Explore" },
  { id: "info", label: "Dataset Info", icon: InfoIcon, group: "Explore" },
  { id: "stats", label: "Statistics", icon: SigmaIcon, group: "Explore" },
  { id: "columns", label: "Columns", icon: ColumnsIcon, group: "Explore" },
  {
    id: "missing",
    label: "Missing Values",
    icon: CircleSlashIcon,
    group: "Quality",
    badge: (a) => (a.missingCells > 0 ? { count: a.missingCells, tone: "amber" } : null),
  },
  {
    id: "duplicates",
    label: "Duplicates",
    icon: CopyIcon,
    group: "Quality",
    badge: (a) =>
      a.duplicateRowCount > 0 ? { count: a.duplicateRowCount, tone: "amber" } : null,
  },
  {
    id: "invalid",
    label: "Validation",
    icon: AlertTriangleIcon,
    group: "Quality",
    badge: (a) => {
      const n = a.columns.reduce((s, c) => s + c.invalidCount, 0);
      return n > 0 ? { count: n, tone: "red" } : null;
    },
  },
  {
    id: "outliers",
    label: "Outliers",
    icon: ActivityIcon,
    group: "Quality",
    badge: (a) => {
      const n = a.columns.reduce((s, c) => s + c.outlierCount, 0);
      return n > 0 ? { count: n, tone: "amber" } : null;
    },
  },
  { id: "correlation", label: "Correlation", icon: GitCompareIcon, group: "Insights" },
  { id: "charts", label: "Charts", icon: BarChart3Icon, group: "Insights" },
  { id: "report", label: "Quality Report", icon: FileCheck2Icon, group: "Insights" },
  { id: "cleaning", label: "Data Cleaning", icon: WandSparklesIcon, group: "Actions" },
  { id: "export", label: "Export", icon: DownloadIcon, group: "Actions" },
];

const GROUPS = ["Explore", "Quality", "Insights", "Actions"];

export function Sidebar({
  active,
  onSelect,
  analysis,
  fileName,
  onReset,
  open,
  onClose,
}: {
  active: ModuleId;
  onSelect: (id: ModuleId) => void;
  analysis: DatasetAnalysis;
  fileName: string;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const handleSelect = (id: ModuleId) => {
    onSelect(id);
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <img
            src="/favicon.svg"
            alt="Data Easy logo"
            className="h-9 w-9 rounded-lg bg-white p-1"
          />
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-bold text-white">Data Easy</p>
            <p className="truncate text-xs text-slate-400" title={fileName}>
              {fileName}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {group}
              </p>
              <div className="space-y-0.5">
                {NAV.filter((n) => n.group === group).map((item) => {
                  const isActive = active === item.id;
                  const badge = item.badge?.(analysis);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-lg bg-slate-700/70 ring-1 ring-slate-600"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <item.icon className="relative z-10 h-4 w-4 shrink-0" />
                      <span className="relative z-10 flex-1 text-left">{item.label}</span>
                      {badge && (
                        <span
                          className={`relative z-10 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            badge.tone === "red"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {badge.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            <XIcon className="h-4 w-4" />
            Reset dataset
          </button>
        </div>
      </aside>
    </>
  );
}
