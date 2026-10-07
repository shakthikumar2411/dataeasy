import React, { useState } from "react";
import { TableIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { Card, ModuleHeader, Badge } from "../ui/primitives";
import { typeTone } from "../ui/tokens";
import { displayCell } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

export function PreviewModule({
  dataset,
  analysis,
}: {
  dataset: Dataset;
  analysis: DatasetAnalysis;
}) {
  const [rowCount, setRowCount] = useState(10);
  const [mode, setMode] = useState<"head" | "tail">("head");

  const typeByCol = new Map(analysis.columns.map((c) => [c.name, c.inferredType]));
  const rows =
    mode === "head"
      ? dataset.rows.slice(0, rowCount)
      : dataset.rows.slice(Math.max(0, dataset.rows.length - rowCount));
  const startIndex = mode === "head" ? 0 : Math.max(0, dataset.rows.length - rowCount);

  return (
    <div>
      <ModuleHeader
        icon={TableIcon}
        title="Dataset Preview"
        subtitle={`${dataset.rows.length.toLocaleString()} rows · ${dataset.columns.length} columns`}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setMode("head")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "head"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ChevronUpIcon className="h-4 w-4" /> Head
              </button>
              <button
                onClick={() => setMode("tail")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "tail"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ChevronDownIcon className="h-4 w-4" /> Tail
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Rows
              <input
                type="number"
                min={1}
                max={dataset.rows.length}
                value={rowCount}
                onChange={(e) =>
                  setRowCount(
                    Math.max(1, Math.min(dataset.rows.length, Number(e.target.value) || 1))
                  )
                }
                className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </label>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-slate-400">
                  #
                </th>
                {dataset.columns.map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      {col}
                      <Badge tone={typeTone(typeByCol.get(col) || "string")}>
                        {typeByCol.get(col)}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 font-mono text-xs text-slate-400">
                    {startIndex + i}
                  </td>
                  {dataset.columns.map((col) => {
                    const v = row[col];
                    const isNull = v === null || v === "";
                    return (
                      <td
                        key={col}
                        className={`whitespace-nowrap px-3 py-2 font-mono text-xs ${
                          isNull ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {isNull ? <span className="italic">null</span> : displayCell(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
