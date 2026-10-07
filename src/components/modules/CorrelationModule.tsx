

import React, { useMemo } from "react";
import { GitCompareIcon } from "lucide-react";
import { Card, ModuleHeader, EmptyState } from "../ui/primitives";
import { computeCorrelation } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

function corrColor(v: number): string {
  // diverging red (neg) - white - blue (pos)
  const a = Math.abs(v);
  if (v >= 0) {
    // blue scale
    const l = 100 - a * 55;
    return `hsl(214, 80%, ${l}%)`;
  }
  const l = 100 - a * 55;
  return `hsl(0, 72%, ${l}%)`;
}

export function CorrelationModule({
  dataset,
  analysis



}: {dataset: Dataset;analysis: DatasetAnalysis;}) {
  const { columns, matrix } = useMemo(
    () => computeCorrelation(dataset, analysis),
    [dataset, analysis]
  );

  const topPairs = useMemo(() => {
    const pairs: {a: string;b: string;v: number;}[] = [];
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        pairs.push({ a: columns[i], b: columns[j], v: matrix[i][j] });
      }
    }
    return pairs.sort((x, y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, 5);
  }, [columns, matrix]);

  return (
    <div>
      <ModuleHeader
        icon={GitCompareIcon}
        title="Correlation Analysis"
        subtitle="Pearson correlation between numeric columns" />
      

      {columns.length < 2 ?
      <EmptyState
        icon={GitCompareIcon}
        title="Not enough numeric columns"
        message="Correlation analysis requires at least two numeric columns." /> :


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-700">
                Correlation Matrix
              </h2>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    {columns.map((c) =>
                  <th
                    key={c}
                    className="p-2 text-xs font-medium text-slate-500"
                    style={{ writingMode: "vertical-rl" }}>
                    
                        <span className="rotate-180">{c}</span>
                      </th>
                  )}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, i) =>
                <tr key={columns[i]}>
                      <th className="whitespace-nowrap px-2 py-1 text-right text-xs font-medium text-slate-500">
                        {columns[i]}
                      </th>
                      {row.map((v, j) =>
                  <td
                    key={j}
                    className="h-12 w-12 text-center text-xs font-semibold"
                    style={{
                      backgroundColor: corrColor(v),
                      color: Math.abs(v) > 0.55 ? "#fff" : "#334155"
                    }}
                    title={`${columns[i]} × ${columns[j]}: ${v}`}>
                    
                          {v.toFixed(2)}
                        </td>
                  )}
                    </tr>
                )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              <span>-1</span>
              <div className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(90deg, hsl(0,72%,45%), #fff, hsl(214,80%,45%))" }} />
              <span>+1</span>
            </div>
          </Card>

          <Card className="h-fit p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Strongest Relationships
            </h3>
            <div className="space-y-2">
              {topPairs.map((p, i) =>
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              
                  <div className="min-w-0 text-sm">
                    <span className="font-medium text-slate-800">{p.a}</span>
                    <span className="mx-1 text-slate-400">×</span>
                    <span className="font-medium text-slate-800">{p.b}</span>
                  </div>
                  <span
                className="ml-2 shrink-0 rounded px-2 py-0.5 font-mono text-xs font-semibold"
                style={{ backgroundColor: corrColor(p.v), color: Math.abs(p.v) > 0.55 ? "#fff" : "#334155" }}>
                
                    {p.v > 0 ? "+" : ""}
                    {p.v.toFixed(2)}
                  </span>
                </div>
            )}
            </div>
          </Card>
        </div>
      }
    </div>);

}