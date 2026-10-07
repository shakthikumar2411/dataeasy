



import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer } from
"recharts";
import { BarChart3Icon, LineChartIcon, PieChartIcon } from "lucide-react";
import { Card, ModuleHeader, EmptyState } from "../ui/primitives";
import { isMissing, toNumber, displayCell } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

type ChartType = "bar" | "line" | "pie";

const PIE_COLORS = ["#1e293b", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#ec4899"];

export function ChartsModule({
  dataset,
  analysis



}: {dataset: Dataset;analysis: DatasetAnalysis;}) {
  const numericCols = analysis.columns.
  filter((c) => c.inferredType === "number" || c.inferredType === "integer").
  map((c) => c.name);
  const catCols = analysis.columns.
  filter((c) => c.inferredType === "string" || c.inferredType === "boolean").
  map((c) => c.name);

  const [type, setType] = useState<ChartType>("bar");
  const [dimension, setDimension] = useState(catCols[0] ?? analysis.columns[0]?.name ?? "");
  const [measure, setMeasure] = useState(numericCols[0] ?? "");

  const data = useMemo(() => {
    const groups = new Map<string, {sum: number;count: number;}>();
    dataset.rows.forEach((r) => {
      const key = isMissing(r[dimension]) ? "(null)" : displayCell(r[dimension]);
      const g = groups.get(key) || { sum: 0, count: 0 };
      const m = measure ? toNumber(r[measure]) : null;
      g.sum += m ?? 0;
      g.count += 1;
      groups.set(key, g);
    });
    return Array.from(groups.entries()).
    map(([label, g]) => ({
      label: label.length > 18 ? label.slice(0, 17) + "…" : label,
      value: measure ? Number((g.sum / g.count).toFixed(2)) : g.count
    })).
    sort((a, b) => b.value - a.value).
    slice(0, 12);
  }, [dataset, dimension, measure]);

  const measureLabel = measure ? `avg ${measure}` : "count";

  const controlSelect =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div>
      <ModuleHeader
        icon={BarChart3Icon}
        title="Visual Charts & Graphs"
        subtitle="Build a quick chart from any dimension and measure"
        actions={
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {([
          { t: "bar", icon: BarChart3Icon },
          { t: "line", icon: LineChartIcon },
          { t: "pie", icon: PieChartIcon }] as
          const).map(({ t, icon: Icon }) =>
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
            type === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`
            }>
            
                <Icon className="h-4 w-4" /> {t}
              </button>
          )}
          </div>
        } />
      

      <Card className="p-5">
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Group by
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className={controlSelect}>
              
              {analysis.columns.map((c) =>
              <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              )}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Measure
            <select
              value={measure}
              onChange={(e) => setMeasure(e.target.value)}
              className={controlSelect}>
              
              <option value="">Row count</option>
              {numericCols.map((c) =>
              <option key={c} value={c}>
                  Average of {c}
                </option>
              )}
            </select>
          </label>
        </div>

        {data.length === 0 ?
        <EmptyState
          icon={BarChart3Icon}
          title="Nothing to chart"
          message="Choose a different grouping column to build a chart." /> :


        <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {type === "bar" ?
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} angle={-25} textAnchor="end" height={60} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="value" name={measureLabel} fill="#1e293b" radius={[4, 4, 0, 0]} />
                </BarChart> :
            type === "line" ?
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} angle={-25} textAnchor="end" height={60} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" name={measureLabel} stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart> :

            <PieChart>
                  <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label={(e: {label?: string;}) => e.label ?? ""}
                labelLine={false}>
                
                    {data.map((_, i) =>
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                )}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
            }
            </ResponsiveContainer>
          </div>
        }
      </Card>
    </div>);

}