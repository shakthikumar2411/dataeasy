
import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine } from
"recharts";
import { ActivityIcon, CheckCircle2Icon } from "lucide-react";
import { Card, ModuleHeader, StatTile, EmptyState, Badge } from "../ui/primitives";
import { fmtNum, toNumber } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

export function OutliersModule({
  dataset,
  analysis



}: {dataset: Dataset;analysis: DatasetAnalysis;}) {
  const numericCols = analysis.columns.filter(
    (c) => (c.inferredType === "number" || c.inferredType === "integer") && c.q1 !== undefined
  );
  const totalOutliers = numericCols.reduce((s, c) => s + c.outlierCount, 0);
  const affected = numericCols.filter((c) => c.outlierCount > 0).length;

  return (
    <div>
      <ModuleHeader
        icon={ActivityIcon}
        title="Outlier Detection"
        subtitle="Values beyond 1.5 × IQR from the quartiles" />
      

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          label="Total Outliers"
          value={totalOutliers.toLocaleString()}
          tone={totalOutliers > 0 ? "amber" : "green"} />
        
        <StatTile label="Numeric Columns" value={numericCols.length} />
        <StatTile
          label="Affected Columns"
          value={affected}
          tone={affected > 0 ? "amber" : "green"} />
        
      </div>

      {numericCols.length === 0 ?
      <div className="mt-6">
          <EmptyState
          icon={ActivityIcon}
          title="No numeric columns"
          message="Outlier detection requires numeric columns. None were found in this dataset." />
        
        </div> :
      totalOutliers === 0 ?
      <div className="mt-6">
          <EmptyState
          icon={CheckCircle2Icon}
          title="No outliers detected"
          message="All numeric values fall within the expected IQR fences." />
        
        </div> :

      <div className="mt-6 space-y-6">
          {numericCols.
        filter((c) => c.outlierCount > 0).
        map((c) => {
          const iqr = (c.q3 ?? 0) - (c.q1 ?? 0);
          const lower = (c.q1 ?? 0) - 1.5 * iqr;
          const upper = (c.q3 ?? 0) + 1.5 * iqr;
          const points = dataset.rows.
          map((r, i) => {
            const n = toNumber(r[c.name]);
            return n === null ? null : { x: i, y: n, outlier: n < lower || n > upper };
          }).
          filter((p): p is {x: number;y: number;outlier: boolean;} => p !== null);
          const normal = points.filter((p) => !p.outlier);
          const outliers = points.filter((p) => p.outlier);

          return (
            <Card key={c.name} className="p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">{c.name}</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge tone="amber">{c.outlierCount} outliers</Badge>
                      <span className="font-mono text-slate-500">
                        fence [{fmtNum(lower)}, {fmtNum(upper)}]
                      </span>
                    </div>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                        <XAxis
                      type="number"
                      dataKey="x"
                      name="row"
                      tick={{ fontSize: 11, fill: "#64748b" }} />
                    
                        <YAxis
                      type="number"
                      dataKey="y"
                      name="value"
                      tick={{ fontSize: 11, fill: "#64748b" }} />
                    
                        <ZAxis range={[40, 40]} />
                        <ReferenceLine y={upper} stroke="#f59e0b" strokeDasharray="4 4" />
                        <ReferenceLine y={lower} stroke="#f59e0b" strokeDasharray="4 4" />
                        <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    
                        <Scatter data={normal} fill="#94a3b8" />
                        <Scatter data={outliers} fill="#dc2626" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Card>);

        })}
        </div>
      }
    </div>);

}