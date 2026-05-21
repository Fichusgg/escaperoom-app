'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

const FINAL_CODE = "HEALTH";
const TIMER_TOTAL_MS = 50 * 60 * 1000;

function normalizeCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function formatElapsedMs(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function IconPlay() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="currentColor" d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}

function IconEnter() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M10 17l1.4-1.4-2.6-2.6H18V11H8.8l2.6-2.6L10 7l-5 5 5 5zm9-14h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
      />
    </svg>
  );
}

function IconBackspace() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M20 3H9c-.7 0-1.4.3-1.8.9L2 12l5.2 8.1c.4.6 1.1.9 1.8.9h11c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2.3 13.3L16.3 17l-3.3-3.3L9.7 17 8.3 15.6 11.6 12 8.3 8.4 9.7 7l3.3 3.3L16.3 7l1.4 1.4L14.4 12l3.3 3.3z"
      />
    </svg>
  );
}

function IconReset() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 5a7 7 0 1 1-6.66 9h2.15A5 5 0 1 0 12 7h-1.1l1.8 1.8-1.4 1.4L7.1 6 11.3 1.8l1.4 1.4L10.9 5H12z"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8">
      <path
        d="M7 12.5 10.2 15.7 17.5 8.4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Home() {
  const expectedCode = useMemo(() => normalizeCode(FINAL_CODE), []);
  const codeLength = expectedCode.length;

  const [phase, setPhase] = useState<"idle" | "running" | "escaped">("idle");
  const [startAt, setStartAt] = useState<number | null>(null);
  const [escapedAt, setEscapedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [entered, setEntered] = useState("");
  const [wrongPulse, setWrongPulse] = useState(false);

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [phase]);

  const elapsedMs = useMemo(() => {
    if (!startAt) return 0;
    if (phase === "escaped" && escapedAt) return escapedAt - startAt;
    return now - startAt;
  }, [escapedAt, now, phase, startAt]);

  const remainingMs = useMemo(() => {
    return Math.max(0, TIMER_TOTAL_MS - elapsedMs);
  }, [elapsedMs]);

  const onStart = useCallback(() => {
    const t = Date.now();
    setStartAt(t);
    setEscapedAt(null);
    setNow(t);
    setEntered("");
    setWrongPulse(false);
    setPhase("running");
  }, []);

  const onReset = useCallback(() => {
    setStartAt(null);
    setEscapedAt(null);
    setNow(Date.now());
    setEntered("");
    setWrongPulse(false);
    setPhase("idle");
  }, []);

  const pressKey = useCallback(
    (key: string) => {
      if (phase !== "running" || remainingMs <= 0) return;
      setEntered((prev) => {
        if (prev.length >= codeLength) return prev;
        return `${prev}${key}`;
      });
      setWrongPulse(false);
    },
    [codeLength, phase, remainingMs],
  );

  const pressBackspace = useCallback(() => {
    if (phase !== "running" || remainingMs <= 0) return;
    setEntered((prev) => prev.slice(0, -1));
    setWrongPulse(false);
  }, [phase, remainingMs]);

  const submit = useCallback(() => {
    if (phase !== "running" || remainingMs <= 0) return;
    if (entered.length !== codeLength) return;
    if (normalizeCode(entered) === expectedCode) {
      setEscapedAt(Date.now());
      setPhase("escaped");
      return;
    }
    setWrongPulse(true);
    window.setTimeout(() => setWrongPulse(false), 260);
    setEntered("");
  }, [codeLength, entered, expectedCode, phase, remainingMs]);

  const keypadButtons = useMemo(() => ["H", "E", "R", "L", "T", "A", "O", "N", "S", "I"], []);

  const stations = useMemo(
    () => [
      { n: 1, name: "Water filter", task: "Build a filter and clean the dirty water sample." },
      { n: 2, name: "Kahoot quiz", task: "Score enough points on the ocean pollution quiz." },
      { n: 3, name: "pH measuring", task: "Measure the pH of the water samples." },
      { n: 4, name: "Secret message", task: "Decrypt the hidden message from the sea." },
      { n: 5, name: "Salt lab", task: "Find out how much salt is in the water." },
      { n: 6, name: "Data analysis", task: "Read the graphs and spot the pollution trend." },
    ],
    [],
  );

  const shellBg =
    "relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-50 px-6 py-16 font-sans text-slate-950 dark:from-slate-950 dark:via-sky-950 dark:to-emerald-950 dark:text-slate-50";

  if (phase === "escaped") {
    return (
      <div className={shellBg}>
        <style>{`
          @keyframes ocean-pop {
            0% { transform: translateY(10px) scale(0.98); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes burst-ring {
            0% { transform: scale(0.2); opacity: 0; }
            15% { opacity: 0.9; }
            100% { transform: scale(2.6); opacity: 0; }
          }
          @keyframes burst-dot {
            0% { transform: translate(0, 0) scale(0.9); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) scale(0.6); opacity: 0; }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
            12% { opacity: 1; }
            100% { transform: translateY(520px) rotate(720deg); opacity: 0; }
          }
          @keyframes wave-drift {
            0% { transform: translateX(-2%) }
            100% { transform: translateX(2%) }
          }
          @media (prefers-reduced-motion: reduce) {
            .ocean-pop, .burst-ring, .burst-dot, .confetti, .wave-drift { animation: none !important; }
          }
        `}</style>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-28 h-96 w-96 rounded-full bg-sky-400/50 blur-3xl dark:bg-sky-400/15" />
          <div className="absolute -right-24 -bottom-28 h-96 w-96 rounded-full bg-emerald-400/45 blur-3xl dark:bg-emerald-400/15" />
          <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/45 blur-3xl dark:bg-cyan-400/10" />

          <svg
            className="wave-drift absolute -bottom-10 left-0 w-full opacity-80 dark:opacity-30"
            viewBox="0 0 1440 240"
            aria-hidden="true"
            preserveAspectRatio="none"
            style={{ animation: "wave-drift 3.2s ease-in-out infinite" }}
          >
            <path
              d="M0,160 C240,220 480,80 720,140 C960,200 1200,120 1440,170 L1440,240 L0,240 Z"
              className="fill-sky-300/70 dark:fill-sky-500/20"
            />
            <path
              d="M0,180 C260,120 520,220 760,160 C1000,100 1220,210 1440,150 L1440,240 L0,240 Z"
              className="fill-emerald-300/60 dark:fill-emerald-500/15"
            />
          </svg>
        </div>

        <main
          className="ocean-pop relative w-full max-w-md"
          style={{ animation: "ocean-pop 520ms ease-out both" }}
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 p-[1px] shadow-xl shadow-sky-900/10">
            <div className="relative overflow-hidden rounded-3xl bg-white/80 p-8 text-center ring-1 ring-black/5 backdrop-blur dark:bg-slate-950/60 dark:ring-white/10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-sky-400/25 blur-3xl dark:bg-sky-400/10" />
                <div className="absolute -right-16 bottom-6 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/10" />
              </div>

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center text-sky-700 dark:text-sky-200">
                <div
                  className="burst-ring absolute inset-0 rounded-full ring-4 ring-sky-500/40 dark:ring-sky-300/25"
                  style={{ animation: "burst-ring 800ms ease-out both" }}
                />
                <div
                  className="burst-ring absolute inset-0 rounded-full ring-4 ring-emerald-500/35 dark:ring-emerald-300/20"
                  style={{ animation: "burst-ring 900ms ease-out both 40ms" }}
                />

                {[
                  { dx: "-46px", dy: "-38px", c: "bg-sky-500" },
                  { dx: "52px", dy: "-34px", c: "bg-cyan-500" },
                  { dx: "-58px", dy: "10px", c: "bg-emerald-500" },
                  { dx: "60px", dy: "12px", c: "bg-sky-400" },
                  { dx: "-22px", dy: "56px", c: "bg-cyan-400" },
                  { dx: "24px", dy: "58px", c: "bg-emerald-400" },
                ].map((dot, index) => (
                  <span
                    key={`${dot.dx}-${dot.dy}`}
                    className={`burst-dot absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${dot.c}`}
                    style={{
                      ["--dx" as never]: dot.dx,
                      ["--dy" as never]: dot.dy,
                      animation: `burst-dot 820ms cubic-bezier(.2,.9,.2,1) both ${
                        index * 18
                      }ms`,
                      boxShadow: "0 10px 30px rgba(14,165,233,.22)",
                    }}
                  />
                ))}

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 ring-1 ring-black/5 shadow-sm dark:bg-white/10 dark:ring-white/10">
                  <IconCheck />
                </div>
              </div>

              <div className="mt-5 font-mono text-3xl tracking-widest text-slate-900/85 dark:text-slate-50/85">
                {formatElapsedMs(remainingMs)}
              </div>

              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-full">
                {[
                  { left: "10%", delay: "0ms", color: "bg-sky-400" },
                  { left: "18%", delay: "60ms", color: "bg-cyan-400" },
                  { left: "26%", delay: "120ms", color: "bg-emerald-400" },
                  { left: "34%", delay: "20ms", color: "bg-sky-300" },
                  { left: "42%", delay: "140ms", color: "bg-cyan-300" },
                  { left: "50%", delay: "80ms", color: "bg-emerald-300" },
                  { left: "58%", delay: "160ms", color: "bg-sky-400" },
                  { left: "66%", delay: "40ms", color: "bg-cyan-400" },
                  { left: "74%", delay: "200ms", color: "bg-emerald-400" },
                  { left: "82%", delay: "100ms", color: "bg-sky-300" },
                ].map((piece) => (
                  <span
                    key={piece.left}
                    className={`confetti absolute top-0 h-2.5 w-1.5 rounded-sm ${piece.color}`}
                    style={{
                      left: piece.left,
                      animation: `confetti-fall 1000ms ease-in both ${piece.delay}`,
                      opacity: 0,
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={onReset}
                aria-label="Restart"
                className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 px-5 text-sm font-medium text-white shadow-lg shadow-sky-600/20 transition-all hover:brightness-110 active:brightness-95 dark:shadow-sky-400/10"
              >
                <IconReset />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={shellBg}>
      <style>{`
        @keyframes wrong-shake {
          0%, 100% { transform: translateX(0) }
          25% { transform: translateX(-6px) }
          75% { transform: translateX(6px) }
        }
        @media (prefers-reduced-motion: reduce) {
          .wrong-shake { animation: none !important; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-400/15" />
        <div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-400/15" />
      </div>

      <main className="relative w-full max-w-md rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-slate-950/60 dark:ring-white/10">
        <div className="mb-5 text-center">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Ocean Rescue
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            The ocean is in trouble. Finish all 6 stations to collect the
            letters and type in the secret 6-letter code.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-mono text-2xl tracking-widest text-slate-900/85 dark:text-slate-50/85">
            {formatElapsedMs(remainingMs)}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStart}
              aria-label="Start"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm transition-colors hover:bg-sky-500 active:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-400"
              disabled={phase !== "idle"}
            >
              <IconPlay />
            </button>
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-transparent text-slate-950 shadow-sm transition-colors hover:bg-white/60 active:bg-white/80 dark:border-white/10 dark:text-slate-50 dark:hover:bg-white/5"
            >
              <IconReset />
            </button>
          </div>
        </div>

        <div
          className={`mt-6 flex items-center justify-center gap-2 ${
            wrongPulse ? "wrong-shake" : ""
          }`}
          style={
            wrongPulse
              ? { animation: "wrong-shake 260ms ease-in-out both" }
              : undefined
          }
          aria-label="Entered code"
          role="status"
        >
          {Array.from({ length: codeLength }).map((_, index) => {
            const letter = entered[index] ?? "";
            const filled = index < entered.length;
            return (
              <div
                key={index}
                aria-hidden="true"
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-center font-mono text-xl font-semibold tracking-widest transition-colors ${
                  wrongPulse
                    ? "border-amber-400/80"
                    : "border-slate-200 dark:border-white/10"
                } ${
                  filled
                    ? "bg-white/80 text-slate-950 dark:bg-white/10 dark:text-slate-50"
                    : "bg-transparent text-slate-400 dark:text-slate-500"
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {keypadButtons.slice(0, 9).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pressKey(key)}
              aria-label={key}
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-white/60 text-xl font-semibold text-slate-950 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white/80 active:bg-white dark:bg-white/5 dark:text-slate-50 dark:ring-white/10 dark:hover:bg-white/10"
              disabled={phase !== "running" || remainingMs <= 0}
            >
              {key}
            </button>
          ))}

          <button
            type="button"
            onClick={pressBackspace}
            aria-label="Backspace"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-white/60 text-slate-950 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white/80 active:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-slate-50 dark:ring-white/10 dark:hover:bg-white/10"
            disabled={phase !== "running" || remainingMs <= 0}
          >
            <IconBackspace />
          </button>

          <button
            type="button"
            onClick={() => pressKey(keypadButtons[9])}
            aria-label={keypadButtons[9]}
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-white/60 text-xl font-semibold text-slate-950 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white/80 active:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-slate-50 dark:ring-white/10 dark:hover:bg-white/10"
            disabled={phase !== "running" || remainingMs <= 0}
          >
            {keypadButtons[9]}
          </button>

          <button
            type="button"
            onClick={submit}
            aria-label="Enter"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            disabled={
              phase !== "running" || remainingMs <= 0 || entered.length !== codeLength
            }
          >
            <IconEnter />
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Your 6 stations
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {stations.map((s) => (
              <li
                key={s.n}
                className="flex items-start gap-3 rounded-xl bg-white/60 p-3 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 font-mono text-sm font-bold text-white">
                  {s.n}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {s.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {s.task} <span className="italic">Earn 1 letter.</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Put the 6 letters in the right order to spell the secret word.
          </p>
        </div>
      </main>
    </div>
  );
}
