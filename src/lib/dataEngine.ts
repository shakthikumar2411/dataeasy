
import Papa from "papaparse";
import type {
  CellValue,
  ColumnProfile,
  ColumnType,
  Dataset,
  DatasetAnalysis,
  Row } from
"../types";

/* ----------------------------- format helpers ---------------------------- */

export const REAL_FORMATS = ["csv", "tsv", "json", "txt"];
export const FALLBACK_FORMATS = ["xls", "xlsx", "parquet", "sql", "xml"];

export function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function isRealParseFormat(ext: string): boolean {
  return REAL_FORMATS.includes(ext);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/* -------------------------------- parsing --------------------------------- */

export interface ParseResult {
  dataset?: Dataset;
  fallback?: {format: string;reason: string;};
  error?: string;
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = getExtension(file.name);

  if (FALLBACK_FORMATS.includes(ext)) {
    return {
      fallback: {
        format: ext.toUpperCase(),
        reason:
        `${ext.toUpperCase()} is a binary or database format. In this browser-based workbench, ` +
        `full ${ext.toUpperCase()} decoding runs server-side. Export your data to CSV, TSV, or JSON to run the complete live analysis.`
      }
    };
  }

  const text = await file.text();

  try {
    if (ext === "json") {
      const rows = parseJson(text);
      return { dataset: buildDataset(file, ext, rows) };
    }
    // csv / tsv / txt
    const delimiter = ext === "tsv" ? "\t" : undefined;
    const parsed = Papa.parse<Row>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: "greedy",
      delimiter,
      transformHeader: (h) => h.trim()
    });
    const rows = (parsed.data as Row[]).filter(
      (r) => r && Object.keys(r).length > 0
    );
    if (rows.length === 0) return { error: "No data rows found in file." };
    return { dataset: buildDataset(file, ext, rows) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to parse file." };
  }
}

function parseJson(text: string): Row[] {
  const data = JSON.parse(text);
  let arr: unknown[];
  if (Array.isArray(data)) arr = data;else
  if (data && typeof data === "object") {
    // find first array property, else wrap
    const arrProp = Object.values(data).find((v) => Array.isArray(v));
    arr = arrProp ? arrProp as unknown[] : [data];
  } else arr = [data];

  return arr.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item as Row;
    }
    return { value: item as CellValue };
  });
}

function buildDataset(file: File, ext: string, rows: Row[]): Dataset {
  const colSet = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
  const columns = Array.from(colSet);
  // normalize: ensure every row has every column
  const normalized = rows.map((r) => {
    const nr: Row = {};
    columns.forEach((c) => {
      nr[c] = r[c] === undefined ? null : normalizeCell(r[c]);
    });
    return nr;
  });
  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    format: ext.toUpperCase(),
    rows: normalized,
    columns,
    loadedAt: Date.now()
  };
}

function normalizeCell(v: unknown): CellValue {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "" || t.toLowerCase() === "null" || t.toLowerCase() === "na" || t.toLowerCase() === "nan")
    return null;
    return v;
  }
  if (typeof v === "number" || typeof v === "boolean") return v;
  return String(v);
}

/* ------------------------------ type helpers ------------------------------ */

export function isMissing(v: CellValue): boolean {
  return v === null || v === undefined || v === "";
}

const DATE_RE = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}([ T]\d{1,2}:\d{2})?/;
const NUM_RE = /^-?\d+(\.\d+)?$/;

export function inferType(values: CellValue[]): ColumnType {
  const nonNull = values.filter((v) => !isMissing(v));
  if (nonNull.length === 0) return "empty";

  let numCount = 0;
  let intCount = 0;
  let boolCount = 0;
  let dateCount = 0;

  for (const v of nonNull) {
    if (typeof v === "boolean") {
      boolCount++;
      continue;
    }
    const s = String(v).trim();
    if (typeof v === "number") {
      numCount++;
      if (Number.isInteger(v)) intCount++;
    } else if (NUM_RE.test(s)) {
      numCount++;
      if (Number.isInteger(Number(s))) intCount++;
    } else if (s === "true" || s === "false") {
      boolCount++;
    } else if (DATE_RE.test(s) && !isNaN(Date.parse(s))) {
      dateCount++;
    }
  }

  const total = nonNull.length;
  if (boolCount / total > 0.8) return "boolean";
  if (numCount / total > 0.8) return intCount === numCount ? "integer" : "number";
  if (dateCount / total > 0.8) return "date";
  return "string";
}

export function toNumber(v: CellValue): number | null {
  if (v === null || v === "") return null;
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  const n = Number(String(v).trim());
  return isNaN(n) ? null : n;
}

/* ------------------------------- statistics ------------------------------- */

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined)
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}

function computeMode(values: CellValue[]): CellValue {
  const freq = new Map<string, {value: CellValue;count: number;}>();
  for (const v of values) {
    if (isMissing(v)) continue;
    const key = String(v);
    const entry = freq.get(key);
    if (entry) entry.count++;else
    freq.set(key, { value: v, count: 1 });
  }
  let best: {value: CellValue;count: number;} | null = null;
  freq.forEach((e) => {
    if (!best || e.count > best.count) best = e;
  });
  return best ? best.value : null;
}

/* -------------------------------- analysis -------------------------------- */

export function analyzeDataset(ds: Dataset): DatasetAnalysis {
  const { rows, columns } = ds;
  const rowCount = rows.length;

  const columnProfiles: ColumnProfile[] = columns.map((col) => {
    const values = rows.map((r) => r[col]);
    const type = inferType(values);
    const nonNull = values.filter((v) => !isMissing(v));
    const nullCount = rowCount - nonNull.length;
    const unique = new Set(nonNull.map((v) => String(v)));

    let memoryBytes = 0;
    for (const v of values) {
      if (typeof v === "number") memoryBytes += 8;else
      if (typeof v === "boolean") memoryBytes += 4;else
      if (typeof v === "string") memoryBytes += v.length * 2;else
      memoryBytes += 1;
    }

    const profile: ColumnProfile = {
      name: col,
      inferredType: type,
      nonNullCount: nonNull.length,
      nullCount,
      uniqueCount: unique.size,
      memoryBytes,
      sampleValues: nonNull.slice(0, 5),
      invalidCount: 0,
      invalidExamples: [],
      outlierCount: 0,
      outlierRowIndexes: [],
      mode: computeMode(values)
    };

    if (type === "number" || type === "integer") {
      const nums: number[] = [];
      values.forEach((v, i) => {
        if (isMissing(v)) return;
        const n = toNumber(v);
        if (n === null) {
          profile.invalidCount++;
          if (profile.invalidExamples.length < 5)
          profile.invalidExamples.push({ rowIndex: i, value: v });
        } else nums.push(n);
      });
      if (nums.length > 0) {
        const sorted = [...nums].sort((a, b) => a - b);
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const variance =
        nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
        profile.mean = mean;
        profile.median = quantile(sorted, 0.5);
        profile.min = sorted[0];
        profile.max = sorted[sorted.length - 1];
        profile.q1 = quantile(sorted, 0.25);
        profile.q3 = quantile(sorted, 0.75);
        profile.std = Math.sqrt(variance);

        // outliers via IQR
        const iqr = profile.q3 - profile.q1;
        const lower = profile.q1 - 1.5 * iqr;
        const upper = profile.q3 + 1.5 * iqr;
        values.forEach((v, i) => {
          const n = toNumber(v);
          if (n !== null && (n < lower || n > upper)) {
            profile.outlierCount++;
            if (profile.outlierRowIndexes.length < 500)
            profile.outlierRowIndexes.push(i);
          }
        });
      }
    } else if (type === "date") {
      values.forEach((v, i) => {
        if (isMissing(v)) return;
        if (isNaN(Date.parse(String(v)))) {
          profile.invalidCount++;
          if (profile.invalidExamples.length < 5)
          profile.invalidExamples.push({ rowIndex: i, value: v });
        }
      });
    } else if (type === "boolean") {
      values.forEach((v, i) => {
        if (isMissing(v)) return;
        const s = String(v).toLowerCase();
        if (typeof v !== "boolean" && s !== "true" && s !== "false") {
          profile.invalidCount++;
          if (profile.invalidExamples.length < 5)
          profile.invalidExamples.push({ rowIndex: i, value: v });
        }
      });
    }

    return profile;
  });

  // duplicates
  const seen = new Map<string, number>();
  const duplicateRowIndexes: number[] = [];
  rows.forEach((r, i) => {
    const key = columns.map((c) => String(r[c])).join("\u0001");
    if (seen.has(key)) duplicateRowIndexes.push(i);else
    seen.set(key, i);
  });

  const totalCells = rowCount * columns.length;
  const missingCells = columnProfiles.reduce((a, c) => a + c.nullCount, 0);
  const memoryBytes = columnProfiles.reduce((a, c) => a + c.memoryBytes, 0);
  const invalidTotal = columnProfiles.reduce((a, c) => a + c.invalidCount, 0);

  const completeness = totalCells > 0 ? 1 - missingCells / totalCells : 1;
  const uniqueness = rowCount > 0 ? 1 - duplicateRowIndexes.length / rowCount : 1;
  const validity = totalCells > 0 ? 1 - invalidTotal / totalCells : 1;
  // consistency: fraction of columns with a clean single type (not string fallback when numeric-ish)
  const consistency =
  columnProfiles.length > 0 ?
  columnProfiles.filter((c) => c.invalidCount === 0).length /
  columnProfiles.length :
  1;

  const qualityScore = Math.round(
    (completeness * 0.35 + uniqueness * 0.2 + validity * 0.3 + consistency * 0.15) *
    100
  );

  return {
    rowCount,
    columnCount: columns.length,
    totalCells,
    memoryBytes,
    missingCells,
    duplicateRowCount: duplicateRowIndexes.length,
    duplicateRowIndexes,
    columns: columnProfiles,
    qualityScore,
    qualityBreakdown: {
      completeness: Math.round(completeness * 100),
      uniqueness: Math.round(uniqueness * 100),
      validity: Math.round(validity * 100),
      consistency: Math.round(consistency * 100)
    }
  };
}

/* ------------------------------ correlation ------------------------------- */

export function pearson(a: number[], b: number[]): number {
  const n = a.length;
  if (n === 0) return 0;
  const meanA = a.reduce((x, y) => x + y, 0) / n;
  const meanB = b.reduce((x, y) => x + y, 0) / n;
  let num = 0,
    denA = 0,
    denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

export interface CorrelationResult {
  columns: string[];
  matrix: number[][];
}

export function computeCorrelation(
ds: Dataset,
analysis: DatasetAnalysis)
: CorrelationResult {
  const numericCols = analysis.columns.
  filter((c) => c.inferredType === "number" || c.inferredType === "integer").
  map((c) => c.name);

  const series: Record<string, (number | null)[]> = {};
  numericCols.forEach((col) => {
    series[col] = ds.rows.map((r) => toNumber(r[col]));
  });

  const matrix = numericCols.map((ci) =>
  numericCols.map((cj) => {
    const pairsA: number[] = [];
    const pairsB: number[] = [];
    for (let i = 0; i < ds.rows.length; i++) {
      const a = series[ci][i];
      const b = series[cj][i];
      if (a !== null && b !== null) {
        pairsA.push(a);
        pairsB.push(b);
      }
    }
    return Number(pearson(pairsA, pairsB).toFixed(3));
  })
  );

  return { columns: numericCols, matrix };
}

/* --------------------------- formatting helpers --------------------------- */

export function fmtNum(n: number | undefined | null, digits = 2): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function displayCell(v: CellValue): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}