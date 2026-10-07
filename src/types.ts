export type CellValue = string | number | boolean | null;

export type Row = Record<string, CellValue>;

export type ColumnType = "number" | "integer" | "string" | "boolean" | "date" | "empty";

export interface ColumnProfile {
  name: string;
  inferredType: ColumnType;
  nonNullCount: number;
  nullCount: number;
  uniqueCount: number;
  memoryBytes: number;
  sampleValues: CellValue[];
  // numeric stats (undefined for non-numeric)
  mean?: number;
  median?: number;
  mode?: CellValue;
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  std?: number;
  // validation
  invalidCount: number;
  invalidExamples: {rowIndex: number;value: CellValue;}[];
  outlierCount: number;
  outlierRowIndexes: number[];
}

export interface Dataset {
  fileName: string;
  fileSizeBytes: number;
  format: string;
  rows: Row[];
  columns: string[];
  loadedAt: number;
}

export interface DatasetAnalysis {
  rowCount: number;
  columnCount: number;
  totalCells: number;
  memoryBytes: number;
  missingCells: number;
  duplicateRowCount: number;
  duplicateRowIndexes: number[];
  columns: ColumnProfile[];
  qualityScore: number;
  qualityBreakdown: {
    completeness: number;
    uniqueness: number;
    validity: number;
    consistency: number;
  };
}

export type ModuleId =
"preview" |
"info" |
"stats" |
"missing" |
"duplicates" |
"invalid" |
"outliers" |
"columns" |
"correlation" |
"charts" |
"report" |
"cleaning" |
"export";

export type FillStrategy = "mean" | "median" | "mode" | "custom" | "drop";

export interface CleaningConfig {
  trimWhitespace: boolean;
  standardizeText: "none" | "lower" | "upper" | "title";
  removeDuplicates: boolean;
  fillMissing: boolean;
  fillStrategy: FillStrategy;
  fillCustomValue: string;
  handleOutliers: "none" | "remove" | "cap";
  coerceNumericTypes: boolean;
}