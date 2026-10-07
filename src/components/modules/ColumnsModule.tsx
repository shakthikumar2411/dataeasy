import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ColumnsIcon } from "lucide-react";
import { Card, ModuleHeader, Badge, StatTile } from "../ui/primitives";
import { typeTone } from "../ui/tokens";
import { fmtNum, isMissing, toNumber, displayCell } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

export function ColumnsModule({
  dataset,
  analysis,
}: {
  dataset: Dataset;
  analysis: DatasetAnalysis;
}) {
  const [selected, setSelected] = useState(analysis.columns[0]?.name ?? "");
  const profile = analysis.columns.find((c) => c.name === selected);

  const distribution = useMemo(() => {
    if (!profile) return [];
    const values = dataset.rows.map((r) => r[selected]).filter((v) => !isMissing(v));
    if (profile.inferredType === "number" || profile.inferredType === "integer") {
      const nums = values.map((v) => toNumber(v)).filter((n): n is number => n !== null);
      if (nums.length === 0) return [];
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const bins = 12;
      const width = (max - min) / bins || 1;
      const counts = new Array(bins).fill(0);
      nums.forEach((n) => {
        const idx = Math.min(bins - 1, Math.floor((n - min) / width));
        counts[idx]++;
      });
      return counts.map((count, i) => ({
        label: fmtNum(min + i * width, 1),
        count,
      }));
    }

    const freq = new Map<string, number>();
    values.forEach((v) => {
      const k = displayCell(v);
      freq.set(k, (freq.get(k) || 0) + 1);
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));
  }, [dataset, selected, profile]);

  const isNumeric =
    profile?.inferredType === "number" || profile?.inferredType === "integer";

  return (
    <div>
      <ModuleHeader
        icon={ColumnsIcon}
        title="Column-wise Analysis"
        subtitle="Deep-dive into any single column"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Columns
            </h2>
          </div>
          <div className="max-h-[520px] overflow-y-auto p-1.5">
            {analysis.columns.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelected(c.name)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected === c.name
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="truncate font-medium">{c.name}</span>
                <span
                  className={`shrink-0 text-[10px] font-semibold uppercase ${
                    selected === c.name ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {c.inferredType}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {profile && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
              <Badge tone={typeTone(profile.inferredType)}>{profile.inferredType}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Non-Null" value={profile.nonNullCount} />
              <StatTile
                label="Missing"
                value={profile.nullCount}
                tone={profile.nullCount > 0 ? "amber" : "neutral"}
              />
              <StatTile label="Unique" value={profile.uniqueCount} />
              <StatTile
                label={isNumeric ? "Outliers" : "Invalid"}
                value={isNumeric ? profile.outlierCount : profile.invalidCount}
                tone={
                  (isNumeric ? profile.outlierCount : profile.invalidCount) > 0
                    ? "red"
                    : "neutral"
                }
              />
            </div>

            {isNumeric && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Mean" value={fmtNum(profile.mean)} tone="blue" />
                <StatTile label="Median" value={fmtNum(profile.median)} tone="blue" />
                <StatTile label="Std Dev" value={fmtNum(profile.std)} tone="blue" />
                <StatTile
                  label="Range"
                  value={`${fmtNum(profile.min)} - ${fmtNum(profile.max)}`}
                  tone="blue"
                />
              </div>
            )}

            <Card className="mt-6 p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                {isNumeric ? "Value Distribution" : "Top Values"}
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      interval={0}
                      angle={isNumeric ? 0 : -25}
                      textAnchor={isNumeric ? "middle" : "end"}
                      height={isNumeric ? 30 : 60}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distribution.map((_, i) => (
                        <Cell key={i} fill="#1e293b" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
