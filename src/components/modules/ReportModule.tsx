



import React from "react";
import { motion } from "framer-motion";
import {
  FileCheck2Icon,
  DownloadIcon,
  CircleSlashIcon,
  CopyIcon,
  AlertTriangleIcon,
  ActivityIcon } from
"lucide-react";
import { Card, ModuleHeader, Button } from "../ui/primitives";
import { exportPdfReport } from "../../lib/exporters";
import type { Dataset, DatasetAnalysis } from "../../types";

function scoreTone(score: number) {
  if (score >= 80) return { ring: "#16a34a", text: "text-emerald-600", label: "Excellent" };
  if (score >= 60) return { ring: "#d97706", text: "text-amber-600", label: "Fair" };
  return { ring: "#dc2626", text: "text-red-600", label: "Needs Work" };
}

function Gauge({ score }: {score: number;}) {
  const tone = scoreTone(score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={tone.ring}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }} />
        
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-extrabold ${tone.text}`}>{score}</span>
        <span className="text-xs font-medium text-slate-400">/ 100</span>
      </div>
    </div>);

}

export function ReportModule({
  dataset,
  analysis



}: {dataset: Dataset;analysis: DatasetAnalysis;}) {
  const tone = scoreTone(analysis.qualityScore);
  const breakdown = [
  { label: "Completeness", value: analysis.qualityBreakdown.completeness },
  { label: "Validity", value: analysis.qualityBreakdown.validity },
  { label: "Uniqueness", value: analysis.qualityBreakdown.uniqueness },
  { label: "Consistency", value: analysis.qualityBreakdown.consistency }];


  const totalInvalid = analysis.columns.reduce((s, c) => s + c.invalidCount, 0);
  const totalOutliers = analysis.columns.reduce((s, c) => s + c.outlierCount, 0);

  const issues = [
  {
    icon: CircleSlashIcon,
    label: "Missing values",
    count: analysis.missingCells,
    hint: "cells are empty across the dataset"
  },
  {
    icon: CopyIcon,
    label: "Duplicate rows",
    count: analysis.duplicateRowCount,
    hint: "fully identical rows detected"
  },
  {
    icon: AlertTriangleIcon,
    label: "Invalid values",
    count: totalInvalid,
    hint: "values conflict with column type"
  },
  {
    icon: ActivityIcon,
    label: "Outliers",
    count: totalOutliers,
    hint: "values beyond the IQR fences"
  }];


  return (
    <div>
      <ModuleHeader
        icon={FileCheck2Icon}
        title="Data Quality Report"
        subtitle="A professional summary of dataset health"
        actions={
        <Button onClick={() => exportPdfReport(dataset, analysis)}>
            <DownloadIcon className="h-4 w-4" />
            Download PDF
          </Button>
        } />
      

      <Card className="p-6">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex flex-col items-center">
            <Gauge score={analysis.qualityScore} />
            <span className={`mt-2 text-sm font-semibold ${tone.text}`}>{tone.label}</span>
          </div>
          <div className="flex-1 space-y-3">
            {breakdown.map((b) =>
            <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{b.label}</span>
                  <span className="font-mono text-xs text-slate-500">{b.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                  className={`h-full rounded-full ${
                  b.value >= 80 ? "bg-emerald-500" : b.value >= 60 ? "bg-amber-400" : "bg-red-500"}`
                  }
                  initial={{ width: 0 }}
                  animate={{ width: `${b.value}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }} />
                
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {issues.map((issue) => {
          const clean = issue.count === 0;
          return (
            <Card key={issue.label} className="p-4">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  clean ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`
                  }>
                  
                  <issue.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">{issue.label}</span>
              </div>
              <p className={`mt-3 text-2xl font-bold ${clean ? "text-emerald-600" : "text-slate-900"}`}>
                {issue.count.toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{issue.hint}</p>
            </Card>);

        })}
      </div>
    </div>);

}