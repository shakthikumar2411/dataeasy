
import React from "react";
import { twMerge } from "tailwind-merge";
import { badgeTones, buttonVariants, type BadgeTone } from "./tokens";

/* ------------------------------- Card ------------------------------------ */
export function Card({
  className,
  children



}: {className?: string;children: React.ReactNode;}) {
  return (
    <div
      className={twMerge(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className
      )}>
      
      {children}
    </div>);

}

export function Badge({
  tone = "neutral",
  className,
  children




}: {tone?: BadgeTone;className?: string;children: React.ReactNode;}) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        badgeTones[tone],
        className
      )}>
      
      {children}
    </span>);

}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        buttonVariants[variant],
        className
      )}
      {...props}>
      
      {children}
    </button>);

}

/* ---------------------------- Section header ----------------------------- */
export function ModuleHeader({
  icon: Icon,
  title,
  subtitle,
  actions





}: {icon: React.ComponentType<{className?: string;}>;title: string;subtitle?: string;actions?: React.ReactNode;}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle &&
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          }
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>);

}

/* ------------------------------ Stat tile -------------------------------- */
export function StatTile({
  label,
  value,
  sub,
  tone = "neutral",
  icon: Icon






}: {label: string;value: React.ReactNode;sub?: string;tone?: BadgeTone;icon?: React.ComponentType<{className?: string;}>;}) {
  const toneText: Record<BadgeTone, string> = {
    neutral: "text-slate-900",
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
    blue: "text-blue-600",
    violet: "text-violet-600"
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {Icon && <Icon className={twMerge("h-4 w-4", toneText[tone])} />}
      </div>
      <p className={twMerge("mt-2 text-2xl font-bold", toneText[tone])}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </Card>);

}

/* ------------------------------ Empty state ------------------------------ */
export function EmptyState({
  icon: Icon,
  title,
  message




}: {icon: React.ComponentType<{className?: string;}>;title: string;message: string;}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
    </div>);

}
