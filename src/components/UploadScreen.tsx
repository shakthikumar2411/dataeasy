import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloudIcon,
  FileSpreadsheetIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  SparklesIcon,
  DatabaseIcon,
  AlertTriangleIcon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "./ui/primitives";
import { parseFile } from "../lib/dataEngine";
import type { Dataset } from "../types";

const SUPPORTED = ["CSV", "TSV", "JSON", "XLSX", "XLS", "XML", "PARQUET", "SQL"];

const FEATURES = [
  { icon: BarChart3Icon, label: "13 analysis modules" },
  { icon: ShieldCheckIcon, label: "Data quality scoring" },
  { icon: SparklesIcon, label: "Smart cleaning" },
  { icon: DatabaseIcon, label: "6 export formats" },
];

export function UploadScreen({ onLoaded }: { onLoaded: (ds: Dataset) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState<{ format: string; reason: string } | null>(
    null
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFallback(null);
      setLoading(true);
      const result = await parseFile(file);
      setLoading(false);
      if (result.dataset) onLoaded(result.dataset);
      else if (result.fallback) setFallback(result.fallback);
      else if (result.error) setError(result.error);
    },
    [onLoaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const loadSample = useCallback(() => {
    const csv =
      "id,name,age,city,salary,join_date,active\n" +
      "1,Alice Chen,29,New York,82000,2021-03-15,true\n" +
      "2,bob smith ,34,Chicago,,2020-07-01,true\n" +
      "3,Carla Ruiz,41,Austin,95000,2019-11-23,false\n" +
      "4,David Ok,29,New York,82000,2021-03-15,true\n" +
      "5,Eve Lin,120,Seattle,73000,2022-01-10,true\n" +
      "6,Frank Ma,,Boston,68000,invalid_date,false\n" +
      "7,grace hall,38,Chicago,410000,2018-05-30,true\n" +
      "8,Alice Chen,29,New York,82000,2021-03-15,true\n" +
      "9,Ivan Petrov,45, Denver ,88000,2020-09-14,yes\n" +
      "10,Jane Doe,31,Miami,79000,2023-02-28,false\n";
    const file = new File([csv], "sample_employees.csv", { type: "text/csv" });
    handleFile(file);
  }, [handleFile]);

  return (
    <div className="relative flex min-h-full w-full flex-col bg-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
        }}
      />

      <header className="relative z-10 flex items-center gap-2 px-6 py-5 sm:px-10">
        <img
          src="/favicon.svg"
          alt="Data Easy logo"
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        />
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">Data Easy</p>
          <p className="text-xs text-slate-500"> Analysis</p>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            Data Analysis Project
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Upload a dataset to begin
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
            Profile, validate, clean, and export your data with a full analytics
            workbench. Your files are parsed locally - nothing leaves your browser.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-8 w-full"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            className={`group flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed bg-white px-6 py-12 text-center transition-all ${
              dragging
                ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-100"
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white transition-transform group-hover:scale-105">
              {loading ? (
                <Loader2Icon className="h-8 w-8 animate-spin" />
              ) : (
                <UploadCloudIcon className="h-8 w-8" />
              )}
            </div>
            <p className="mt-4 text-base font-semibold text-slate-800">
              {loading ? "Parsing your dataset..." : "Drag & drop or click to upload"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              CSV, TSV, and JSON are analyzed live in your browser
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
              {SUPPORTED.map((f) => (
                <span
                  key={f}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {f}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.tsv,.json,.txt,.xls,.xlsx,.xml,.parquet,.sql"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-sm text-slate-400">or</span>
            <Button variant="secondary" onClick={loadSample} disabled={loading}>
              <FileSpreadsheetIcon className="h-4 w-4" />
              Try a sample dataset
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {fallback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800"
            >
              <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold">
                  {fallback.format} detected - live analysis unavailable
                </p>
                <p className="mt-1 text-amber-700">{fallback.reason}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-4 text-center backdrop-blur"
            >
              <f.icon className="h-5 w-5 text-slate-700" />
              <span className="text-xs font-medium text-slate-600">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
