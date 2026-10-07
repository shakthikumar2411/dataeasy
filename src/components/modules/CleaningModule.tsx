




import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WandSparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  RotateCcwIcon } from
"lucide-react";
import { Card, ModuleHeader, Button, Badge } from "../ui/primitives";
import { runCleaning } from "../../lib/cleaning";
import { analyzeDataset } from "../../lib/dataEngine";
import type { CleaningConfig, Dataset, DatasetAnalysis } from "../../types";

interface Toggle {
  key: keyof CleaningConfig;
  title: string;
  desc: string;
}

const TOGGLES: Toggle[] = [
{ key: "trimWhitespace", title: "Trim whitespace", desc: "Remove leading/trailing spaces and collapse repeats" },
{ key: "removeDuplicates", title: "Remove duplicates", desc: "Drop fully identical rows, keep the first" },
{ key: "coerceNumericTypes", title: "Fix numeric types", desc: "Convert numeric-looking text into real numbers" }];


export function CleaningModule({
  dataset,
  analysis,
  onApply




}: {dataset: Dataset;analysis: DatasetAnalysis;onApply: (ds: Dataset) => void;}) {
  const [config, setConfig] = useState<CleaningConfig>({
    trimWhitespace: true,
    standardizeText: "none",
    removeDuplicates: true,
    fillMissing: true,
    fillStrategy: "median",
    fillCustomValue: "0",
    handleOutliers: "none",
    coerceNumericTypes: true
  });
  const [applied, setApplied] = useState(false);

  const result = useMemo(
    () => runCleaning(dataset, analysis, config),
    [dataset, analysis, config]
  );
  const cleanedAnalysis = useMemo(
    () => analyzeDataset(result.dataset),
    [result.dataset]
  );

  const set = <K extends keyof CleaningConfig,>(key: K, value: CleaningConfig[K]) =>
  setConfig((c) => ({ ...c, [key]: value }));

  const selectCls =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  const deltas = [
  { label: "Rows", before: analysis.rowCount, after: cleanedAnalysis.rowCount },
  { label: "Missing cells", before: analysis.missingCells, after: cleanedAnalysis.missingCells },
  { label: "Duplicate rows", before: analysis.duplicateRowCount, after: cleanedAnalysis.duplicateRowCount },
  { label: "Quality score", before: analysis.qualityScore, after: cleanedAnalysis.qualityScore, suffix: "" }];


  return (
    <div>
      <ModuleHeader
        icon={WandSparklesIcon}
        title="Data Cleaning"
        subtitle="Configure operations, preview the impact, then apply"
        actions={
        <Button
          onClick={() => {
            onApply(result.dataset);
            setApplied(true);
            setTimeout(() => setApplied(false), 2500);
          }}>
          
            {applied ? <CheckIcon className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
            {applied ? "Applied" : "Apply cleaning"}
          </Button>
        } />
      

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* configuration */}
        <div className="space-y-3">
          {TOGGLES.map((t) =>
          <ToggleRow
            key={t.key}
            title={t.title}
            desc={t.desc}
            checked={config[t.key] as boolean}
            onChange={(v) => set(t.key, v as never)} />

          )}

          {/* Fill missing */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Fill missing values</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Impute empty cells with a strategy
                </p>
              </div>
              <Switch checked={config.fillMissing} onChange={(v) => set("fillMissing", v)} />
            </div>
            <AnimatePresence initial={false}>
              {config.fillMissing &&
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                    <select
                    value={config.fillStrategy}
                    onChange={(e) => set("fillStrategy", e.target.value as CleaningConfig["fillStrategy"])}
                    className={selectCls}>
                    
                      <option value="mean">Mean (numeric)</option>
                      <option value="median">Median (numeric)</option>
                      <option value="mode">Mode (most frequent)</option>
                      <option value="custom">Custom value</option>
                      <option value="drop">Drop rows</option>
                    </select>
                    {config.fillStrategy === "custom" &&
                  <input
                    value={config.fillCustomValue}
                    onChange={(e) => set("fillCustomValue", e.target.value)}
                    placeholder="Value"
                    className={selectCls + " w-28"} />

                  }
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </Card>

          {/* Standardize text */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Standardize text casing</p>
                <p className="mt-0.5 text-xs text-slate-500">Normalize casing on text columns</p>
              </div>
              <select
                value={config.standardizeText}
                onChange={(e) => set("standardizeText", e.target.value as CleaningConfig["standardizeText"])}
                className={selectCls}>
                
                <option value="none">Leave as-is</option>
                <option value="lower">lowercase</option>
                <option value="upper">UPPERCASE</option>
                <option value="title">Title Case</option>
              </select>
            </div>
          </Card>

          {/* Outliers */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Handle outliers</p>
                <p className="mt-0.5 text-xs text-slate-500">Values beyond 1.5 × IQR</p>
              </div>
              <select
                value={config.handleOutliers}
                onChange={(e) => set("handleOutliers", e.target.value as CleaningConfig["handleOutliers"])}
                className={selectCls}>
                
                <option value="none">Keep</option>
                <option value="cap">Cap to fences</option>
                <option value="remove">Remove rows</option>
              </select>
            </div>
          </Card>
        </div>

        {/* preview */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <RotateCcwIcon className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">Preview impact</h3>
            </div>
            <div className="space-y-2.5">
              {deltas.map((d) => {
                const changed = d.before !== d.after;
                const good =
                d.label === "Quality score" ? d.after >= d.before : d.after <= d.before;
                return (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{d.label}</span>
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">{d.before.toLocaleString()}</span>
                      <ArrowRightIcon className="h-3 w-3 text-slate-300" />
                      <span
                        className={`font-semibold ${
                        !changed ? "text-slate-500" : good ? "text-emerald-600" : "text-amber-600"}`
                        }>
                        
                        {d.after.toLocaleString()}
                      </span>
                    </span>
                  </div>);

              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Operations to apply
            </h3>
            {result.steps.length === 0 ?
            <p className="text-sm text-slate-400">
                No changes needed with the current configuration.
              </p> :

            <ul className="space-y-2.5">
                {result.steps.map((s) =>
              <li key={s.id} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{s.label}</span>
                        <Badge tone="green">{s.affected.toLocaleString()}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{s.detail}</p>
                    </div>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>
      </div>
    </div>);

}

function ToggleRow({
  title,
  desc,
  checked,
  onChange





}: {title: string;desc: string;checked: boolean;onChange: (v: boolean) => void;}) {
  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </Card>);

}

function Switch({ checked, onChange }: {checked: boolean;onChange: (v: boolean) => void;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
      checked ? "bg-slate-900" : "bg-slate-200"}`
      }>
      
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        style={{ left: checked ? 22 : 2 }} />
      
    </button>);

}