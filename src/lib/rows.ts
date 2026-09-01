/**
 * View-model builders that turn simulator draws into table cells.
 * Shared by the homepage results preview and the /results/ archive so both
 * stay perfectly in sync.
 */
import {
  fmtClock,
  type Draw,
  type FiveDDraw,
  type K3Draw,
  type WinGoDraw,
} from "./simulator";

export type CellKind =
  | "text-strong"
  | "text-muted"
  | "mono"
  | "gold"
  | "chip-green"
  | "chip-red"
  | "chip-violet"
  | "chip-gold"
  | "chip-neutral"
  | "ball-green"
  | "ball-red"
  | "ball-violet"
  | "ball-dual-red"
  | "ball-dual-green";

export interface Cell {
  text: string;
  kind?: CellKind;
  /** Screen-reader-only context appended for accessibility. */
  sr?: string;
}

export interface ResultsRow {
  cells: Cell[];
}

const sizeChip = (size: "Big" | "Small"): Cell => ({
  text: size,
  kind: size === "Big" ? "chip-gold" : "chip-neutral",
  sr: `Size ${size}`,
});

export function winGoRow(d: WinGoDraw): ResultsRow {
  const ballKind =
    d.colors.length === 2
      ? d.colors[0] === "red"
        ? "ball-dual-red"
        : "ball-dual-green"
      : d.colors[0] === "green"
        ? "ball-green"
        : d.colors[0] === "red"
          ? "ball-red"
          : "ball-violet";
  return {
    cells: [
      { text: d.period, kind: "mono" },
      { text: String(d.number), kind: ballKind, sr: `Number ${d.number}` },
      {
        text: d.colors.map((c) => c[0].toUpperCase() + c.slice(1)).join(" + "),
        kind: d.colors[0] === "green" ? "chip-green" : d.colors[0] === "red" ? "chip-red" : "chip-violet",
      },
      sizeChip(d.size),
      { text: fmtClock(d.time), kind: "text-muted" },
    ],
  };
}

export function k3Row(d: K3Draw): ResultsRow {
  return {
    cells: [
      { text: d.period, kind: "mono" },
      { text: d.dice.join(" · "), kind: "mono" },
      { text: String(d.sum), kind: "text-strong" },
      sizeChip(d.size),
      { text: d.parity, kind: "chip-neutral" },
      { text: fmtClock(d.time), kind: "text-muted" },
    ],
  };
}

export function fiveDRow(d: FiveDDraw): ResultsRow {
  return {
    cells: [
      { text: d.period, kind: "mono" },
      { text: d.digits.join(" "), kind: "mono" },
      { text: String(d.sum), kind: "text-strong" },
      sizeChip(d.size),
      { text: fmtClock(d.time), kind: "text-muted" },
    ],
  };
}

export function rowsFor(game: "wingo" | "k3" | "5d", draws: Draw[]): ResultsRow[] {
  return draws.map((d) => {
    if (game === "wingo") return winGoRow(d as WinGoDraw);
    if (game === "k3") return k3Row(d as K3Draw);
    return fiveDRow(d as FiveDDraw);
  });
}
