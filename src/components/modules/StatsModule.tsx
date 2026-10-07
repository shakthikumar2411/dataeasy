import React from "react";
import { SigmaIcon } from "lucide-react";
import { Card, ModuleHeader, Badge, EmptyState } from "../ui/primitives";
import { typeTone } from "../ui/tokens";
import { fmtNum, displayCell } from "../../lib/dataEngine";
import type { DatasetAnalysis } from "../../types";

export function StatsModule({ analysis }: { analysis: DatasetAnalysis }) {
  const numeric = analysis.columns.filter(
    (c) => c.inferredType === "number" || c.inferredType === "integer"
  );
  const categorical = analysis.columns.filter(
    (c) => c.inferredType !== "number" && c.inferredType !== "integer"
  );

  return (
    <div>
      <ModuleHeader
        icon={SigmaIcon}
        title="Statistical Summary"
        subtitle="Descriptive statistics for every column"
      />

      {numeric.length === 0 ? (
        <EmptyState
          icon={SigmaIcon}
          title="No numeric columns"
          message="This dataset has no numeric columns to summarize. Check the categorical summary below."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-700">Numeric Columns</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-5 py-2.5">Column</th>
                  <th className="px-5 py-2.5 text-right">Count</th>
                  <th className="px-5 py-2.5 text-right">Mean</th>
                  <th className="px-5 py-2.5 text-right">Std</th>
                  <th className="px-5 py-2.5 text-right">Min</th>
                  <th className="px-5 py-2.5 text-right">25%</th>
                  <th className="px-5 py-2.5 text-right">Median</th>
                  <th className="px-5 py-2.5 text-right">75%</th>
                  <th className="px-5 py-2.5 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {numeric.map((c) => (
                  <tr
                    key={c.name}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-2.5 font-sans font-medium text-slate-800">{c.name}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{c.nonNullCount}</td>
                    <td className="px-5 py-2.5 text-right text-slate-800">{fmtNum(c.mean)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{fmtNum(c.std)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{fmtNum(c.min)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{fmtNum(c.q1)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-800">{fmtNum(c.median)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{fmtNum(c.q3)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{fmtNum(c.max)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {categorical.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-700">Categorical Columns</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-5 py-2.5">Column</th>
                  <th className="px-5 py-2.5">Type</th>
                  <th className="px-5 py-2.5 text-right">Count</th>
                  <th className="px-5 py-2.5 text-right">Unique</th>
                  <th className="px-5 py-2.5">Most Frequent (mode)</th>
                </tr>
              </thead>
              <tbody>
                {categorical.map((c) => (
                  <tr
                    key={c.name}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-2.5 font-medium text-slate-800">{c.name}</td>
                    <td className="px-5 py-2.5">
                      <Badge tone={typeTone(c.inferredType)}>{c.inferredType}</Badge>
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-slate-600">
                      {c.nonNullCount}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-slate-600">
                      {c.uniqueCount}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-xs text-slate-700">
                      {c.mode != null ? displayCell(c.mode) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
