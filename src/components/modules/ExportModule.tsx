






import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  FileJsonIcon,
  FileTextIcon,
  FileIcon,
  DatabaseIcon,
  BoxIcon,
  InfoIcon } from
"lucide-react";
import { Card, ModuleHeader, Badge } from "../ui/primitives";
import {
  exportCsv,
  exportJson,
  exportXlsx,
  exportSql,
  exportPdfReport,
  exportParquetNote } from
"../../lib/exporters";
import { formatBytes } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

export function ExportModule({
  dataset,
  analysis,
  cleaned




}: {dataset: Dataset;analysis: DatasetAnalysis;cleaned: boolean;}) {
  const [done, setDone] = useState<string | null>(null);

  const flash = (id: string) => {
    setDone(id);
    setTimeout(() => setDone((d) => d === id ? null : d), 1800);
  };

  const options = [
  {
    id: "csv",
    icon: FileTextIcon,
    title: "CSV",
    desc: "Comma-separated values, universally compatible",
    tone: "green" as const,
    run: () => exportCsv(dataset)
  },
  {
    id: "xlsx",
    icon: FileSpreadsheetIcon,
    title: "Excel (.xlsx)",
    desc: "Native spreadsheet workbook via SheetJS",
    tone: "green" as const,
    run: () => exportXlsx(dataset)
  },
  {
    id: "json",
    icon: FileJsonIcon,
    title: "JSON",
    desc: "Array of records for APIs and pipelines",
    tone: "blue" as const,
    run: () => exportJson(dataset)
  },
  {
    id: "sql",
    icon: DatabaseIcon,
    title: "SQL Insert Script",
    desc: "CREATE TABLE + INSERT statements",
    tone: "violet" as const,
    run: () => exportSql(dataset)
  },
  {
    id: "pdf",
    icon: FileIcon,
    title: "PDF Quality Report",
    desc: "Formatted report with profiles and scoring",
    tone: "red" as const,
    run: () => exportPdfReport(dataset, analysis)
  },
  {
    id: "parquet",
    icon: BoxIcon,
    title: "Parquet",
    desc: "Columnar format — export instructions provided",
    tone: "amber" as const,
    note: true,
    run: () => exportParquetNote()
  }];


  return (
    <div>
      <ModuleHeader
        icon={DownloadIcon}
        title="Export Dataset"
        subtitle={`${dataset.rows.length.toLocaleString()} rows · ${dataset.columns.length} columns · ${formatBytes(analysis.memoryBytes)}`}
        actions={
        cleaned ?
        <Badge tone="green">Exporting cleaned data</Badge> :

        <Badge tone="neutral">Exporting original data</Badge>

        } />
      

      {!cleaned &&
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            You're exporting the original dataset. Run the{" "}
            <span className="font-semibold">Data Cleaning</span> module first to export a
            cleaned version.
          </span>
        </div>
      }

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) =>
        <motion.button
          key={opt.id}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            opt.run();
            flash(opt.id);
          }}
          className="group text-left">
          
            <Card className="flex h-full flex-col p-5 transition-shadow group-hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <opt.icon className="h-5 w-5" />
                </div>
                {opt.note && <Badge tone="amber">note</Badge>}
              </div>
              <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
              <p className="mt-1 flex-1 text-xs text-slate-500">{opt.desc}</p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                {done === opt.id ?
              <span className="text-emerald-600">Downloaded ✓</span> :

              <>
                    <DownloadIcon className="h-4 w-4" />
                    Download
                  </>
              }
              </div>
            </Card>
          </motion.button>
        )}
      </div>
    </div>);

}