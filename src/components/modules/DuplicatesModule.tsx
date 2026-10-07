









import React from "react";
import { CopyIcon, CheckCircle2Icon } from "lucide-react";
import { Card, ModuleHeader, StatTile, EmptyState, Badge } from "../ui/primitives";
import { displayCell } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

export function DuplicatesModule({
  dataset,
  analysis



}: {dataset: Dataset;analysis: DatasetAnalysis;}) {
  const dupIndexes = analysis.duplicateRowIndexes.slice(0, 100);
  const pct =
  analysis.rowCount > 0 ?
  analysis.duplicateRowCount / analysis.rowCount * 100 :
  0;

  return (
    <div>
      <ModuleHeader
        icon={CopyIcon}
        title="Duplicate Detection"
        subtitle="Fully identical rows across all columns" />
      

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          label="Duplicate Rows"
          value={analysis.duplicateRowCount.toLocaleString()}
          tone={analysis.duplicateRowCount > 0 ? "amber" : "green"} />
        
        <StatTile label="Duplicate %" value={`${pct.toFixed(2)}%`} />
        <StatTile
          label="Unique Rows"
          value={(analysis.rowCount - analysis.duplicateRowCount).toLocaleString()}
          tone="green" />
        
      </div>

      {analysis.duplicateRowCount === 0 ?
      <div className="mt-6">
          <EmptyState
          icon={CheckCircle2Icon}
          title="No duplicate rows"
          message="Every row in this dataset is unique across all columns." />
        
        </div> :

      <Card className="mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Duplicate Rows
            </h2>
            {analysis.duplicateRowCount > 100 &&
          <Badge tone="amber">Showing first 100</Badge>
          }
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-2.5">Row #</th>
                  {dataset.columns.map((col) =>
                <th key={col} className="whitespace-nowrap px-4 py-2.5">
                      {col}
                    </th>
                )}
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {dupIndexes.map((idx) =>
              <tr
                key={idx}
                className="border-b border-slate-100 bg-amber-50/40 last:border-0">
                
                    <td className="px-4 py-2 font-semibold text-amber-700">{idx}</td>
                    {dataset.columns.map((col) =>
                <td
                  key={col}
                  className="whitespace-nowrap px-4 py-2 text-slate-700">
                  
                        {displayCell(dataset.rows[idx][col])}
                      </td>
                )}
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </Card>
      }
    </div>);

}