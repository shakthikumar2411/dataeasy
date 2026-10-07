












import React from "react";
import { AlertTriangleIcon, CheckCircle2Icon, ShieldCheckIcon } from "lucide-react";
import { Card, ModuleHeader, StatTile, EmptyState, Badge } from "../ui/primitives";
import { typeTone } from "../ui/tokens";
import { displayCell } from "../../lib/dataEngine";
import type { DatasetAnalysis } from "../../types";

export function ValidationModule({ analysis }: {analysis: DatasetAnalysis;}) {
  const invalidCols = analysis.columns.
  filter((c) => c.invalidCount > 0).
  sort((a, b) => b.invalidCount - a.invalidCount);
  const totalInvalid = analysis.columns.reduce((s, c) => s + c.invalidCount, 0);

  return (
    <div>
      <ModuleHeader
        icon={AlertTriangleIcon}
        title="Data Validation"
        subtitle="Values that don't match their column's inferred type" />
      

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          label="Invalid Cells"
          value={totalInvalid.toLocaleString()}
          tone={totalInvalid > 0 ? "red" : "green"} />
        
        <StatTile label="Affected Columns" value={invalidCols.length} tone={invalidCols.length > 0 ? "red" : "green"} />
        <StatTile
          label="Type Validity"
          value={`${analysis.qualityBreakdown.validity}%`}
          tone={analysis.qualityBreakdown.validity >= 95 ? "green" : "amber"} />
        
      </div>

      {/* Type validation overview */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Data Type Validation</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="px-5 py-2.5">Column</th>
                <th className="px-5 py-2.5">Inferred Type</th>
                <th className="px-5 py-2.5 text-right">Invalid</th>
                <th className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {analysis.columns.map((c) =>
              <tr key={c.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td className="px-5 py-2.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={typeTone(c.inferredType)}>{c.inferredType}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs text-slate-600">
                    {c.invalidCount}
                  </td>
                  <td className="px-5 py-2.5">
                    {c.invalidCount === 0 ?
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2Icon className="h-3.5 w-3.5" /> Valid
                      </span> :

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertTriangleIcon className="h-3.5 w-3.5" /> {c.invalidCount} issue
                        {c.invalidCount > 1 ? "s" : ""}
                      </span>
                  }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {invalidCols.length === 0 ?
      <div className="mt-6">
          <EmptyState
          icon={ShieldCheckIcon}
          title="No invalid values detected"
          message="Every value conforms to its column's inferred data type." />
        
        </div> :

      <div className="mt-6 space-y-4">
          {invalidCols.map((c) =>
        <Card key={c.name} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-red-100 bg-red-50/50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                  <Badge tone={typeTone(c.inferredType)}>expects {c.inferredType}</Badge>
                </div>
                <Badge tone="red">{c.invalidCount} invalid</Badge>
              </div>
              <div className="px-5 py-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Example offending values
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.invalidExamples.map((ex, i) =>
              <span
                key={i}
                className="rounded-md bg-red-50 px-2 py-1 font-mono text-xs text-red-700 ring-1 ring-inset ring-red-200">
                
                      row {ex.rowIndex}: "{displayCell(ex.value)}"
                    </span>
              )}
                </div>
              </div>
            </Card>
        )}
        </div>
      }
    </div>);

}
