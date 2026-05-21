"use client";

import { useCallback, useEffect, useState } from "react";

const FINAL_CODE = "HEALTH";
const CODE_LENGTH = FINAL_CODE.length;
const TIMER_TOTAL_MS = 40 * 60 * 1000;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function normalize(v: string) {
  return v.trim().toUpperCase();
}

function fmt(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Home() {
  const [entered, setEntered] = useState("");
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);

  // Timer — controlled with Start / End buttons
  const [timerState, setTimerState] = useState<"idle" | "running" | "ended">(
    "idle",
  );
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(0);
  const [frozenElapsed, setFrozenElapsed] = useState(0);

  useEffect(() => {
    if (timerState !== "running" || startAt === null) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [timerState, startAt]);

  const elapsed =
    timerState === "running" && startAt !== null
      ? now - startAt
      : frozenElapsed;
  const remaining = Math.max(0, TIMER_TOTAL_MS - elapsed);

  const startTimer = useCallback(() => {
    const t = Date.now();
    setStartAt(t);
    setNow(t);
    setFrozenElapsed(0);
    setTimerState("running");
  }, []);

  const endTimer = useCallback(() => {
    if (timerState === "running" && startAt !== null) {
      setFrozenElapsed(Date.now() - startAt);
    }
    setTimerState("ended");
  }, [timerState, startAt]);

  const press = useCallback(
    (k: string) => {
      if (done) return;
      setEntered((p) => (p.length >= CODE_LENGTH ? p : p + k));
      setWrong(false);
    },
    [done],
  );

  const back = useCallback(() => {
    if (done) return;
    setEntered((p) => p.slice(0, -1));
    setWrong(false);
  }, [done]);

  const submit = useCallback(() => {
    if (done) return;
    if (entered.length !== CODE_LENGTH) return;
    if (normalize(entered) === FINAL_CODE) {
      setDone(true);
      return;
    }
    setWrong(true);
    window.setTimeout(() => setWrong(false), 400);
    setEntered("");
  }, [entered, done]);

  const reset = useCallback(() => {
    setEntered("");
    setWrong(false);
    setDone(false);
    setTimerState("idle");
    setStartAt(null);
    setNow(0);
    setFrozenElapsed(0);
  }, []);

  // Keyboard input
  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (k === "BACKSPACE") {
        e.preventDefault();
        back();
      } else if (k === "ENTER") {
        e.preventDefault();
        submit();
      } else if (k.length === 1 && k >= "A" && k <= "Z") {
        e.preventDefault();
        press(k);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, back, submit, done]);

  // Bubbles (decorative) — generated only on client to avoid SSR hydration mismatch
  const [bubbles, setBubbles] = useState<
    { id: number; left: string; size: number; duration: number; delay: number }[]
  >([]);
  useEffect(() => {
    setBubbles(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 6 + Math.random() * 14,
        duration: 9 + Math.random() * 9,
        delay: -Math.random() * 12,
      })),
    );
  }, []);

  const lowTime =
    timerState === "running" && remaining > 0 && remaining < 5 * 60 * 1000;
  const expired = timerState === "running" && remaining <= 0;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-b from-sky-700 via-cyan-800 to-slate-900">
      {/* bubbles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {bubbles.map((b) => (
          <span
            key={b.id}
            className="absolute bottom-0 rounded-full bg-white/40 ring-1 ring-white/30"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animation: `bubble-rise ${b.duration}s linear ${b.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <main className="relative z-10 w-full max-w-3xl rounded-2xl bg-slate-900/60 p-6 sm:p-10 backdrop-blur ring-1 ring-cyan-300/20 shadow-xl">
        {done ? (
          <div className="mx-auto max-w-md text-center">
            <div className="text-5xl">🌊</div>
            <h1 className="mt-3 text-2xl font-bold text-cyan-50">You did it!</h1>
            <p className="mt-2 text-cyan-100/80">
              The code was <span className="font-mono font-bold">HEALTH</span>.
              A healthy ocean is a healthy planet.
            </p>
            <p className="mt-4 font-mono text-3xl text-cyan-50">
              {fmt(elapsed)}
            </p>
            <button
              onClick={reset}
              className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900 hover:bg-cyan-400"
            >
              Play again
            </button>
          </div>
        ) : (
          <>
            <header className="text-center">
              <h1 className="text-3xl font-bold text-cyan-50">
                Ocean Pollution Escape Room
              </h1>
              <p className="mt-2 text-base text-cyan-100/80">
                Complete all 6 stations. Each one gives you one letter. Put them
                together to find the secret word about the ocean&apos;s health.
              </p>
            </header>

            {/* Timer */}
            <div className="mt-6 flex justify-center">
              <div
                className={`font-mono text-5xl sm:text-6xl font-bold tabular-nums ${
                  expired
                    ? "text-rose-300"
                    : lowTime
                    ? "text-amber-300"
                    : "text-cyan-50"
                }`}
                role="timer"
                aria-label={`Time remaining ${fmt(remaining)}`}
              >
                {fmt(remaining)}
              </div>
            </div>

            {/* Code slots */}
            <div
              className="mt-8 flex justify-center gap-2"
              style={
                wrong
                  ? { animation: "wrong-shake 400ms ease-in-out" }
                  : undefined
              }
              role="status"
              aria-label="Entered code"
            >
              {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                const ch = entered[i] ?? "";
                const filled = i < entered.length;
                return (
                  <div
                    key={i}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border font-mono text-2xl font-bold ${
                      wrong
                        ? "border-amber-400 bg-amber-400/10"
                        : filled
                        ? "border-cyan-300 bg-cyan-400/20 text-cyan-50"
                        : "border-cyan-300/30 bg-white/5 text-cyan-200/40"
                    }`}
                  >
                    {ch || "•"}
                  </div>
                );
              })}
            </div>

            {/* Alphabet keypad */}
            <div className="mx-auto mt-8 grid max-w-md grid-cols-7 gap-2">
              {ALPHABET.map((k) => (
                <button
                  key={k}
                  onClick={() => press(k)}
                  className="h-11 rounded-lg bg-white/10 font-mono text-base font-bold text-cyan-50 hover:bg-white/15 active:bg-white/20"
                >
                  {k}
                </button>
              ))}
              <button
                onClick={back}
                aria-label="Backspace"
                className="h-11 rounded-lg bg-white/10 text-cyan-50 hover:bg-white/15"
              >
                ⌫
              </button>
              <button
                onClick={submit}
                disabled={entered.length !== CODE_LENGTH}
                className="h-11 rounded-lg bg-emerald-500 text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enter
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={startTimer}
                disabled={timerState === "running"}
                className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {timerState === "idle" ? "Start" : "Restart"}
              </button>
              <button
                onClick={endTimer}
                disabled={timerState !== "running"}
                className="rounded-lg border border-cyan-300/40 bg-transparent px-5 py-2 text-sm font-semibold text-cyan-50 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                End
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
