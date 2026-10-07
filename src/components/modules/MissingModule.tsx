







import React from "react";
import { CircleSlashIcon, CheckCircle2Icon } from "lucide-react";
import { Card, ModuleHeader, StatTile, EmptyState } from "../ui/primitives";
import type { DatasetAnalysis } from "../../types";

export function MissingModule({ analysis }: {analysis: DatasetAnalysis;}) {
  const withMissing = analysis.columns.
  filter((c) => c.nullCount > 0).
  sort((a, b) => b.nullCount - a.nullCount);

  const pctTotal =
  analysis.totalCells > 0 ?
  analysis.missingCells / analysis.totalCells * 100 :
  0;

  return (
    <div>
      <ModuleHeader
        icon={CircleSlashIcon}
        title="Missing Value Analysis"
        subtitle="Locate and quantify gaps in the data" />
      

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          label="Missing Cells"
          value={analysis.missingCells.toLocaleString()}
          tone={analysis.missingCells > 0 ? "amber" : "green"} />
        
        <StatTile label="Missing %" value={`${pctTotal.toFixed(2)}%`} />
        <StatTile
          label="Affected Columns"
          value={withMissing.length}
          tone={withMissing.length > 0 ? "amber" : "green"} />
        
      </div>

      {withMissing.length === 0 ?
      <div className="mt-6">
          <EmptyState
          icon={CheckCircle2Icon}
          title="No missing values"
          message="Every cell in this dataset is populated. Completeness is 100%." />
        
        </div> :

      <Card className="mt-6 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Missing by Column
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {withMissing.map((c) => {
            const pct = c.nullCount / analysis.rowCount * 100;
            const severe = pct > 30;
            return (
              <div key={c.name} className="px-5 py-3.5">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <span className="font-mono text-xs text-slate-500">
                      {c.nullCount.toLocaleString()} / {analysis.rowCount.toLocaleString()}{" "}
                      ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                    className={`h-full rounded-full ${
                    severe ? "bg-red-500" : "bg-amber-400"}`
                    }
                    style={{ width: `${Math.max(2, pct)}%` }} />
                  
                  </div>
                </div>);

          })}
          </div>
        </Card>
      }
    </div>);

}