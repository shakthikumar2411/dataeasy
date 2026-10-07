export type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue" | "violet";

export const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

export const buttonVariants = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm disabled:bg-slate-300",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50",
  ghost: "text-slate-600 hover:bg-slate-100 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm disabled:opacity-50",
} satisfies Record<"primary" | "secondary" | "ghost" | "danger", string>;

export function typeTone(type: string): BadgeTone {
  switch (type) {
    case "number":
    case "integer":
      return "blue";
    case "string":
      return "violet";
    case "date":
      return "green";
    case "boolean":
      return "amber";
    default:
      return "neutral";
  }
}
