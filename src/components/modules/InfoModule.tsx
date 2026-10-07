import React from "react";
import {
  InfoIcon,
  RowsIcon,
  ColumnsIcon,
  HardDriveIcon,
  Grid3x3Icon,
} from "lucide-react";
import { Card, ModuleHeader, StatTile, Badge } from "../ui/primitives";
import { typeTone } from "../ui/tokens";
import { formatBytes } from "../../lib/dataEngine";
import type { Dataset, DatasetAnalysis } from "../../types";

export function InfoModule({
  dataset,
  analysis,
}: {
  dataset: Dataset;
  analysis: DatasetAnalysis;
}) {
  return (
    <div>
      <ModuleHeader
        icon={InfoIcon}
        title="Dataset Information"
        subtitle={`Source: ${dataset.fileName} · ${dataset.format} · ${formatBytes(
          dataset.fileSizeBytes
        )}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Rows" value={analysis.rowCount.toLocaleString()} icon={RowsIcon} />
        <StatTile label="Columns" value={analysis.columnCount} icon={ColumnsIcon} />
        <StatTile
          label="Total Cells"
          value={analysis.totalCells.toLocaleString()}
          icon={Grid3x3Icon}
        />
        <StatTile
          label="Memory (est.)"
          value={formatBytes(analysis.memoryBytes)}
          icon={HardDriveIcon}
        />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Column Schema</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="px-5 py-2.5">#</th>
                <th className="px-5 py-2.5">Column</th>
                <th className="px-5 py-2.5">Type</th>
                <th className="px-5 py-2.5">Non-Null</th>
                <th className="px-5 py-2.5">Nulls</th>
                <th className="px-5 py-2.5">Unique</th>
                <th className="px-5 py-2.5">Memory</th>
              </tr>
            </thead>
            <tbody>
              {analysis.columns.map((c, i) => (
                <tr
                  key={c.name}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-2.5 font-mono text-xs text-slate-400">{i}</td>
                  <td className="px-5 py-2.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={typeTone(c.inferredType)}>{c.inferredType}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-slate-600">
                    {c.nonNullCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-2.5">
                    {c.nullCount > 0 ? (
                      <span className="font-medium text-amber-600">
                        {c.nullCount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-slate-600">
                    {c.uniqueCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-slate-500">
                    {formatBytes(c.memoryBytes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
