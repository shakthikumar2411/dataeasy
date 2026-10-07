
import type {
  CleaningConfig,
  ColumnProfile,
  Dataset,
  DatasetAnalysis,
  Row } from
"../types";
import { analyzeDataset, isMissing, toNumber } from "./dataEngine";

export interface CleaningStep {
  id: string;
  label: string;
  detail: string;
  affected: number;
}

export interface CleaningResult {
  dataset: Dataset;
  steps: CleaningStep[];
}

const TITLE = (s: string) =>
s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

export function runCleaning(
ds: Dataset,
analysis: DatasetAnalysis,
config: CleaningConfig)
: CleaningResult {
  const steps: CleaningStep[] = [];
  const profileByName = new Map<string, ColumnProfile>();
  analysis.columns.forEach((c) => profileByName.set(c.name, c));

  // clone rows
  let rows: Row[] = ds.rows.map((r) => ({ ...r }));

  // 1. Trim whitespace
  if (config.trimWhitespace) {
    let affected = 0;
    rows = rows.map((r) => {
      const nr = { ...r };
      ds.columns.forEach((c) => {
        const v = nr[c];
        if (typeof v === "string") {
          const t = v.trim().replace(/\s+/g, " ");
          if (t !== v) affected++;
          nr[c] = t;
        }
      });
      return nr;
    });
    if (affected)
    steps.push({
      id: "trim",
      label: "Trimmed whitespace",
      detail: "Removed leading/trailing spaces and collapsed repeats",
      affected
    });
  }

  // 2. Standardize text
  if (config.standardizeText !== "none") {
    let affected = 0;
    rows = rows.map((r) => {
      const nr = { ...r };
      ds.columns.forEach((c) => {
        const prof = profileByName.get(c);
        if (prof && prof.inferredType === "string") {
          const v = nr[c];
          if (typeof v === "string" && v !== "") {
            let t = v;
            if (config.standardizeText === "lower") t = v.toLowerCase();else
            if (config.standardizeText === "upper") t = v.toUpperCase();else
            if (config.standardizeText === "title") t = TITLE(v);
            if (t !== v) affected++;
            nr[c] = t;
          }
        }
      });
      return nr;
    });
    if (affected)
    steps.push({
      id: "standardize",
      label: `Standardized text (${config.standardizeText})`,
      detail: "Normalized casing across text columns",
      affected
    });
  }

  // 3. Coerce numeric types
  if (config.coerceNumericTypes) {
    let affected = 0;
    rows = rows.map((r) => {
      const nr = { ...r };
      ds.columns.forEach((c) => {
        const prof = profileByName.get(c);
        if (prof && (prof.inferredType === "number" || prof.inferredType === "integer")) {
          const v = nr[c];
          if (v !== null && typeof v !== "number") {
            const n = toNumber(v);
            if (n !== null) {
              affected++;
              nr[c] = n;
            }
          }
        }
      });
      return nr;
    });
    if (affected)
    steps.push({
      id: "coerce",
      label: "Coerced numeric types",
      detail: "Converted numeric-looking text into real numbers",
      affected
    });
  }

  // 4. Fill missing
  if (config.fillMissing) {
    if (config.fillStrategy === "drop") {
      const before = rows.length;
      rows = rows.filter((r) => ds.columns.every((c) => !isMissing(r[c])));
      const affected = before - rows.length;
      if (affected)
      steps.push({
        id: "fill-drop",
        label: "Dropped rows with missing values",
        detail: "Removed rows containing any null/empty cell",
        affected
      });
    } else {
      let affected = 0;
      const fills = new Map<string, string | number>();
      ds.columns.forEach((c) => {
        const prof = profileByName.get(c);
        if (!prof) return;
        const numeric = prof.inferredType === "number" || prof.inferredType === "integer";
        if (config.fillStrategy === "custom") {
          fills.set(c, config.fillCustomValue);
        } else if (numeric && config.fillStrategy === "mean" && prof.mean !== undefined) {
          fills.set(c, Number(prof.mean.toFixed(4)));
        } else if (numeric && config.fillStrategy === "median" && prof.median !== undefined) {
          fills.set(c, prof.median);
        } else if (config.fillStrategy === "mode" && prof.mode != null) {
          fills.set(c, prof.mode as string | number);
        } else if (prof.mode != null) {
          fills.set(c, prof.mode as string | number);
        }
      });
      rows = rows.map((r) => {
        const nr = { ...r };
        ds.columns.forEach((c) => {
          if (isMissing(nr[c]) && fills.has(c)) {
            const fill = fills.get(c);
            if (fill !== undefined) {
              nr[c] = fill;
              affected++;
            }
          }
        });
        return nr;
      });
      if (affected)
      steps.push({
        id: "fill",
        label: `Filled missing values (${config.fillStrategy})`,
        detail: "Imputed empty cells using the selected strategy",
        affected
      });
    }
  }

  // 5. Handle outliers
  if (config.handleOutliers !== "none") {
    let affected = 0;
    const numericProfiles = analysis.columns.filter(
      (c) => (c.inferredType === "number" || c.inferredType === "integer") && c.q1 !== undefined
    );
    if (config.handleOutliers === "cap") {
      rows = rows.map((r) => {
        const nr = { ...r };
        numericProfiles.forEach((p) => {
          const iqr = (p.q3 ?? 0) - (p.q1 ?? 0);
          const lower = (p.q1 ?? 0) - 1.5 * iqr;
          const upper = (p.q3 ?? 0) + 1.5 * iqr;
          const n = toNumber(nr[p.name]);
          if (n !== null) {
            if (n < lower) {
              nr[p.name] = Number(lower.toFixed(4));
              affected++;
            } else if (n > upper) {
              nr[p.name] = Number(upper.toFixed(4));
              affected++;
            }
          }
        });
        return nr;
      });
      if (affected)
      steps.push({
        id: "outlier-cap",
        label: "Capped outliers",
        detail: "Clamped extreme values to the IQR fences",
        affected
      });
    } else {
      const outlierRows = new Set<number>();
      numericProfiles.forEach((p) => p.outlierRowIndexes.forEach((i) => outlierRows.add(i)));
      const before = rows.length;
      rows = rows.filter((_, i) => !outlierRows.has(i));
      affected = before - rows.length;
      if (affected)
      steps.push({
        id: "outlier-remove",
        label: "Removed outlier rows",
        detail: "Dropped rows with values beyond the IQR fences",
        affected
      });
    }
  }

  // 6. Remove duplicates (last so counts are on cleaned data)
  if (config.removeDuplicates) {
    const seen = new Set<string>();
    const before = rows.length;
    rows = rows.filter((r) => {
      const key = ds.columns.map((c) => String(r[c])).join("\u0001");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const affected = before - rows.length;
    if (affected)
    steps.push({
      id: "dedupe",
      label: "Removed duplicate rows",
      detail: "Kept the first occurrence of each identical row",
      affected
    });
  }

  const cleaned: Dataset = {
    ...ds,
    rows,
    fileName: ds.fileName.replace(/\.[^.]+$/, "") + "_cleaned"
  };

  return { dataset: cleaned, steps };
}

export function reanalyze(ds: Dataset): DatasetAnalysis {
  return analyzeDataset(ds);
}
