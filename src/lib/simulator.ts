/**
 * Yarrwin — deterministic draw simulator.
 *
 * Every draw is derived from a hash of its period id, so the same period always
 * produces the same result — identical output on the server (build time) and the
 * client (live board). This keeps pre-rendered SEO tables in perfect sync with
 * the interactive islands without any backend.
 *
 * PRODUCTION NOTE: replace `drawFor` / `history` with your real results feed
 * (REST/WS) and keep the same exported types — components won't need changes.
 */

export type GameId = "wingo" | "k3" | "5d" | "aviator";
export type ResultColor = "green" | "red" | "violet";
export type ResultSize = "Big" | "Small";

export interface WinGoDraw {
  game: "wingo";
  period: string;
  number: number; // 0–9
  colors: ResultColor[];
  size: ResultSize;
  time: Date;
}

export interface K3Draw {
  game: "k3";
  period: string;
  dice: [number, number, number]; // 1–6 each
  sum: number; // 3–18
  size: ResultSize; // Big 11–18 · Small 3–10
  parity: "Odd" | "Even";
  time: Date;
}

export interface FiveDDraw {
  game: "5d";
  period: string;
  digits: [number, number, number, number, number]; // A–E, 0–9 each
  sum: number; // 0–45
  size: ResultSize; // Big 23–45 · Small 0–22
  time: Date;
}

export interface AviatorRound {
  game: "aviator";
  round: string;
  multiplier: number; // crash point, 1.01×–50×
  time: Date;
}

export type Draw = WinGoDraw | K3Draw | FiveDDraw;

export const GAME_META = {
  wingo: { name: "WinGo 1 Min", short: "WINGO", intervalSec: 60 },
  k3: { name: "K3 Lottery", short: "K3", intervalSec: 180 },
  "5d": { name: "5D Lottery", short: "5D", intervalSec: 300 },
} as const;

export type TimedGameId = keyof typeof GAME_META;

/* ------------------------------------------------------------------ */
/* Deterministic PRNG (FNV-1a hash → mulberry32)                       */
/* ------------------------------------------------------------------ */

function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Periods & timing (UTC for build/client determinism)                 */
/* ------------------------------------------------------------------ */

function ymd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function secondsOfDay(date: Date): number {
  return date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds();
}

/** e.g. wingo @ 2026-09-01T00:00:30Z → "202609010001" */
export function periodFor(game: TimedGameId, time: Date): string {
  const serial = Math.floor(secondsOfDay(time) / GAME_META[game].intervalSec) + 1;
  return `${ymd(time)}${String(serial).padStart(4, "0")}`;
}

/** Epoch ms of the next draw boundary for a game. */
export function nextDrawAt(game: TimedGameId, time: Date): number {
  const periodMs = GAME_META[game].intervalSec * 1000;
  const sod = secondsOfDay(time) * 1000;
  return time.getTime() - sod + (Math.floor(sod / periodMs) + 1) * periodMs;
}

/* ------------------------------------------------------------------ */
/* Draw generators                                                     */
/* ------------------------------------------------------------------ */

/** WinGo colour convention: 0 Red+Violet · 5 Green+Violet · even Red · odd Green. */
export function wingoColors(n: number): ResultColor[] {
  if (n === 0) return ["red", "violet"];
  if (n === 5) return ["green", "violet"];
  return n % 2 === 0 ? ["red"] : ["green"];
}

export function wingoDraw(period: string, time = new Date()): WinGoDraw {
  const r = rng(hash32(`wingo:${period}`));
  const n = Math.floor(r() * 10);
  return { game: "wingo", period, number: n, colors: wingoColors(n), size: n >= 5 ? "Big" : "Small", time };
}

export function k3Draw(period: string, time = new Date()): K3Draw {
  const r = rng(hash32(`k3:${period}`));
  const dice: [number, number, number] = [
    1 + Math.floor(r() * 6),
    1 + Math.floor(r() * 6),
    1 + Math.floor(r() * 6),
  ];
  const sum = dice[0] + dice[1] + dice[2];
  return {
    game: "k3",
    period,
    dice,
    sum,
    size: sum >= 11 ? "Big" : "Small",
    parity: sum % 2 === 0 ? "Even" : "Odd",
    time,
  };
}

export function fiveDDraw(period: string, time = new Date()): FiveDDraw {
  const r = rng(hash32(`5d:${period}`));
  const digits = [0, 0, 0, 0, 0].map(() => Math.floor(r() * 10)) as FiveDDraw["digits"];
  const sum = digits.reduce((a, b) => a + b, 0);
  return { game: "5d", period, digits, sum, size: sum >= 23 ? "Big" : "Small", time };
}

export function drawFor(game: TimedGameId, period: string, time = new Date()): Draw {
  return game === "wingo" ? wingoDraw(period, time) : game === "k3" ? k3Draw(period, time) : fiveDDraw(period, time);
}

/** Newest-first history for tables/boards. */
export function history(game: TimedGameId, count: number, now = new Date()): Draw[] {
  const out: Draw[] = [];
  for (let i = 1; i <= count; i++) {
    const t = new Date(now.getTime() - i * GAME_META[game].intervalSec * 1000);
    out.push(drawFor(game, periodFor(game, t), t));
  }
  return out;
}

export function aviatorRounds(count: number, now = new Date()): AviatorRound[] {
  const out: AviatorRound[] = [];
  const ROUND_MS = 15_000;
  for (let i = 1; i <= count; i++) {
    const t = new Date(now.getTime() - i * ROUND_MS);
    const r = rng(hash32(`avi:${t.getTime()}`));
    // Heavy-tail distribution: most rounds crash early, rare moonshots.
    const u = r();
    const multiplier = Math.min(50, Math.max(1.01, Math.round((1 / (1 - u * 0.96)) * 100) / 100));
    out.push({ game: "aviator", round: `R-${String(41_200 + t.getUTCHours() * 137 + t.getUTCMinutes())}`, multiplier, time: t });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function fmtClock(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(date.getUTCSeconds())}`;
}

export function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
