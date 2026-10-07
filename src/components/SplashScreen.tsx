import React from "react";
import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <div className="relative flex min-h-full w-full items-center justify-center overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.22) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse 80% 65% at 50% 25%, black, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 flex w-[min(92vw,28rem)] flex-col items-center rounded-[2rem] border border-white/10 bg-white/6 px-8 py-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl"
      >
        <motion.img
          src="/favicon.svg"
          alt="Data Easy logo"
          initial={{ opacity: 0, scale: 0.82, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          className="h-24 w-24 rounded-3xl border border-white/10 bg-white p-3 shadow-lg shadow-black/20"
        />

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          Welcome
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          welcome to Data Easy
        </h1>
        <p className="mt-3 text-base text-slate-300"></p>

        <div className="mt-8 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          <span
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-400"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-500"
            style={{ animationDelay: "240ms" }}
          />
        </div>

        <p className="mt-6 text-sm text-slate-400">Preparing your upload workspace...</p>
      </motion.div>
    </div>
  );
}
