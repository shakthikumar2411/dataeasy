import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { PreviewModule } from "./modules/PreviewModule";
import { InfoModule } from "./modules/InfoModule";
import { StatsModule } from "./modules/StatsModule";
import { ColumnsModule } from "./modules/ColumnsModule";
import { MissingModule } from "./modules/MissingModule";
import { DuplicatesModule } from "./modules/DuplicatesModule";
import { ValidationModule } from "./modules/ValidationModule";
import { OutliersModule } from "./modules/OutliersModule";
import { CorrelationModule } from "./modules/CorrelationModule";
import { ChartsModule } from "./modules/ChartsModule";
import { ReportModule } from "./modules/ReportModule";
import { CleaningModule } from "./modules/CleaningModule";
import { ExportModule } from "./modules/ExportModule";
import { analyzeDataset } from "../lib/dataEngine";
import type { Dataset, ModuleId } from "../types";

export function Workbench({
  dataset,
  onReplace,
  onReset,
}: {
  dataset: Dataset;
  onReplace: (ds: Dataset) => void;
  onReset: () => void;
}) {
  const [active, setActive] = useState<ModuleId>("preview");
  const [cleaned, setCleaned] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const analysis = useMemo(() => analyzeDataset(dataset), [dataset]);

  const handleApplyCleaning = (ds: Dataset) => {
    onReplace(ds);
    setCleaned(true);
  };

  const renderModule = () => {
    switch (active) {
      case "preview":
        return <PreviewModule dataset={dataset} analysis={analysis} />;
      case "info":
        return <InfoModule dataset={dataset} analysis={analysis} />;
      case "stats":
        return <StatsModule analysis={analysis} />;
      case "columns":
        return <ColumnsModule dataset={dataset} analysis={analysis} />;
      case "missing":
        return <MissingModule analysis={analysis} />;
      case "duplicates":
        return <DuplicatesModule dataset={dataset} analysis={analysis} />;
      case "invalid":
        return <ValidationModule analysis={analysis} />;
      case "outliers":
        return <OutliersModule dataset={dataset} analysis={analysis} />;
      case "correlation":
        return <CorrelationModule dataset={dataset} analysis={analysis} />;
      case "charts":
        return <ChartsModule dataset={dataset} analysis={analysis} />;
      case "report":
        return <ReportModule dataset={dataset} analysis={analysis} />;
      case "cleaning":
        return (
          <CleaningModule
            dataset={dataset}
            analysis={analysis}
            onApply={handleApplyCleaning}
          />
        );
      case "export":
        return <ExportModule dataset={dataset} analysis={analysis} cleaned={cleaned} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">
      <Sidebar
        active={active}
        onSelect={setActive}
        analysis={analysis}
        fileName={dataset.fileName}
        onReset={onReset}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/favicon.svg"
              alt="Data Easy logo"
              className="h-7 w-7 rounded-md border border-slate-200 bg-white p-0.5"
            />
            <span className="text-sm font-bold text-slate-900">Data Easy</span>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active + (cleaned ? "-c" : "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
