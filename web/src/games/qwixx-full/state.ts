import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Qwixx (Full) — 3-seat variant: 1 human + 2 CPU.
 *
 * Each player has a scorecard with 4 colored rows:
 *   Red    2 → 12 ascending
 *   Yellow 2 → 12 ascending
 *   Green  12 → 2 descending
 *   Blue   12 → 2 descending
 *
 * Each turn: the ACTIVE player rolls 6 dice (2 white + R + Y + G + B).
 *   - All players may cross off (white1 + white2) in any one row (optional).
 *   - The active player may ADDITIONALLY cross off (one white + one colored)
 *     in that color's row (optional).
 * Crosses must be ascending in row order (skipping cells is allowed, but you
 * can never go back). The rightmost cross of a row (12 for red/yellow, 2 for
 * green/blue) requires at least 5 prior crosses; locking it closes that row
 * for every player.
 * If the active player makes no cross at all, they take a penalty (-5).
 * Game ends when four rows are locked total OR any player has 4 penalties.
 *
 * Row score table by cross count (locking adds +1 to the cross count):
 *   1=1, 2=3, 3=6, 4=10, 5=15, 6=21, 7=28, 8=36, 9=45, 10=55, 11=66, 12=78
 */

export interface QwixxFullSettings {
  cpuLevel: "easy" | "normal";
}

export type Color = "red" | "yellow" | "green" | "blue";
export const COLORS: readonly Color[] = ["red", "yellow", "green", "blue"];

// Row values (left → right) as displayed on the scorecard.
export const ROW_VALUES: Record<Color, readonly number[]> = {
  red:    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  yellow: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  green:  [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  blue:   [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
};

const ROW_LEN = 11;

const SCORE_TABLE = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78];

export function rowScore(crosses: number): number {
  const idx = Math.min(Math.max(crosses, 0), SCORE_TABLE.length - 1);
  return SCORE_TABLE[idx] ?? 0;
}

export interface PlayerCard {
  /** 11 booleans per color, true = crossed-off cell at that column index. */
  checked: Record<Color, boolean[]>;
  penalties: number;
}

export type Phase = "preRoll" | "rolled" | "done";

export interface QwixxFullState {
  settings: QwixxFullSettings;
  rngSeed: number;
  players: PlayerCard[];          // index 0 = human, 1+ = CPU
  active: number;                 // whose turn (index into players)
  locked: Record<Color, boolean>; // shared across all players
  whiteDice: [number, number];
  colorDice: Record<Color, number>;
  phase: Phase;
  /** Active-player tracking for "must mark something or take penalty" rule. */
  activeMadeWhiteMark: boolean;
  activeMadeColorMark: boolean;
  /** Per-player "has acted on the white sum this turn" — non-active players
   *  each get one optional white mark per roll. */
  whiteActed: boolean[];
  /** True once active player has explicitly passed on color (or marked color
   *  already); used to gate "end turn" without ambiguity. */
  activePassedColor: boolean;
  rollCount: number;
  /** Most recent log line ("CPU 1 marked red 7", …) — UI only. */
  lastEvent: string;
}

export type QwixxFullAction =
  | { type: "roll" }
  | { type: "markWhite"; player: number; color: Color; index: number }
  | { type: "markColor"; color: Color; index: number }
  | { type: "skipColor" }
  | { type: "takePenalty" }
  | { type: "endTurn" }
  | { type: "cpuStep" };

function nextSeed(seed: number): number {
  // 32-bit LCG-ish advance to avoid leaking same seed downstream.
  return ((seed * 1664525) + 1013904223) >>> 0;
}

function rollD6(seedRef: { s: number }): number {
  const rng = mulberry32(seedRef.s);
  const v = Math.floor(rng() * 6) + 1;
  seedRef.s = nextSeed(seedRef.s);
  return v;
}

function rollAll(seed: number): {
  whiteDice: [number, number];
  colorDice: Record<Color, number>;
  nextSeed: number;
} {
  const ref = { s: seed >>> 0 };
  const w1 = rollD6(ref);
  const w2 = rollD6(ref);
  const r = rollD6(ref);
  const y = rollD6(ref);
  const g = rollD6(ref);
  const b = rollD6(ref);
  return {
    whiteDice: [w1, w2],
    colorDice: { red: r, yellow: y, green: g, blue: b },
    nextSeed: ref.s,
  };
}

function rightmostChecked(checked: readonly boolean[]): number {
  for (let i = checked.length - 1; i >= 0; i--) {
    if (checked[i]) return i;
  }
  return -1;
}

function crossCount(checked: readonly boolean[]): number {
  let c = 0;
  for (const v of checked) if (v) c++;
  return c;
}

export function canCross(
  checked: readonly boolean[],
  locked: boolean,
  index: number,
): boolean {
  if (locked) return false;
  if (index < 0 || index >= ROW_LEN) return false;
  if (checked[index]) return false;
  if (index > rightmostChecked(checked)) {
    if (index === ROW_LEN - 1) {
      // Locking cell: requires 5+ prior crosses.
      return crossCount(checked) >= 5;
    }
    return true;
  }
  return false;
}

function countLocked(locked: Record<Color, boolean>): number {
  let n = 0;
  for (const c of COLORS) if (locked[c]) n++;
  return n;
}

function anyMaxPenalty(players: readonly PlayerCard[]): boolean {
  return players.some((p) => p.penalties >= 4);
}

function gameDone(state: QwixxFullState): boolean {
  return countLocked(state.locked) >= 4 || anyMaxPenalty(state.players);
}

function emptyCard(): PlayerCard {
  return {
    checked: {
      red: Array(ROW_LEN).fill(false),
      yellow: Array(ROW_LEN).fill(false),
      green: Array(ROW_LEN).fill(false),
      blue: Array(ROW_LEN).fill(false),
    },
    penalties: 0,
  };
}

export function initialState(
  seed: number,
  settings: QwixxFullSettings,
): QwixxFullState {
  return {
    settings,
    rngSeed: seed >>> 0,
    players: [emptyCard(), emptyCard(), emptyCard()],
    active: 0,
    locked: { red: false, yellow: false, green: false, blue: false },
    whiteDice: [0, 0],
    colorDice: { red: 0, yellow: 0, green: 0, blue: 0 },
    phase: "preRoll",
    activeMadeWhiteMark: false,
    activeMadeColorMark: false,
    whiteActed: [false, false, false],
    activePassedColor: false,
    rollCount: 0,
    lastEvent: "",
  };
}

/** White cross attempt — value must equal white1+white2. */
function attemptWhiteCross(
  state: QwixxFullState,
  playerIdx: number,
  color: Color,
  index: number,
): QwixxFullState | null {
  if (state.phase !== "rolled") return null;
  if (playerIdx < 0 || playerIdx >= state.players.length) return null;
  if (state.whiteActed[playerIdx]) return null;
  if (state.locked[color]) return null;
  const want = state.whiteDice[0] + state.whiteDice[1];
  const vals = ROW_VALUES[color];
  if (vals[index] !== want) return null;
  const card = state.players[playerIdx];
  if (!card) return null;
  if (!canCross(card.checked[color], state.locked[color], index)) return null;

  const newRow = card.checked[color].slice();
  newRow[index] = true;
  const newCard: PlayerCard = {
    ...card,
    checked: { ...card.checked, [color]: newRow },
  };
  const newPlayers = state.players.slice();
  newPlayers[playerIdx] = newCard;

  // Check for row lock: marking the rightmost cell.
  const newLocked = { ...state.locked };
  if (index === ROW_LEN - 1) newLocked[color] = true;

  const whiteActed = state.whiteActed.slice();
  whiteActed[playerIdx] = true;

  const isActive = playerIdx === state.active;
  return {
    ...state,
    players: newPlayers,
    locked: newLocked,
    whiteActed,
    activeMadeWhiteMark: isActive ? true : state.activeMadeWhiteMark,
  };
}

/** Color cross attempt — value must equal one of (whiteN + colorDie[color]). */
function attemptColorCross(
  state: QwixxFullState,
  color: Color,
  index: number,
): QwixxFullState | null {
  if (state.phase !== "rolled") return null;
  if (state.activeMadeColorMark) return null;
  if (state.locked[color]) return null;
  const cv = state.colorDice[color];
  const s1 = state.whiteDice[0] + cv;
  const s2 = state.whiteDice[1] + cv;
  const vals = ROW_VALUES[color];
  if (vals[index] !== s1 && vals[index] !== s2) return null;
  const card = state.players[state.active];
  if (!card) return null;
  if (!canCross(card.checked[color], state.locked[color], index)) return null;

  const newRow = card.checked[color].slice();
  newRow[index] = true;
  const newCard: PlayerCard = {
    ...card,
    checked: { ...card.checked, [color]: newRow },
  };
  const newPlayers = state.players.slice();
  newPlayers[state.active] = newCard;

  const newLocked = { ...state.locked };
  if (index === ROW_LEN - 1) newLocked[color] = true;

  return {
    ...state,
    players: newPlayers,
    locked: newLocked,
    activeMadeColorMark: true,
    activePassedColor: true,
  };
}

function endTurnTransition(state: QwixxFullState): QwixxFullState {
  // Decide penalty: active player neither marked white nor color.
  let s = state;
  if (!s.activeMadeWhiteMark && !s.activeMadeColorMark) {
    const card = s.players[s.active];
    if (card) {
      const newPlayers = s.players.slice();
      newPlayers[s.active] = { ...card, penalties: card.penalties + 1 };
      s = { ...s, players: newPlayers, lastEvent: `P${s.active + 1} took a penalty` };
    }
  }
  if (gameDone(s)) return { ...s, phase: "done" };
  const next = (s.active + 1) % s.players.length;
  return {
    ...s,
    active: next,
    phase: "preRoll",
    activeMadeWhiteMark: false,
    activeMadeColorMark: false,
    whiteActed: [false, false, false],
    activePassedColor: false,
    whiteDice: [0, 0],
    colorDice: { red: 0, yellow: 0, green: 0, blue: 0 },
  };
}

/** Pick a CPU move: greedy — best legal cross that doesn't waste many slots.
 *  CPU may take both a white mark and a color mark on its own turn. */
function cpuChooseAndApply(state: QwixxFullState): QwixxFullState {
  const aiIdx = state.active;
  if (aiIdx === 0) return state; // human, never auto-act
  let s = state;

  const evalWhite = (): { color: Color; index: number } | null => {
    if (s.whiteActed[aiIdx]) return null;
    const target = s.whiteDice[0] + s.whiteDice[1];
    let best: { color: Color; index: number; cost: number } | null = null;
    for (const c of COLORS) {
      if (s.locked[c]) continue;
      const card = s.players[aiIdx];
      if (!card) continue;
      const vals = ROW_VALUES[c];
      const idx = vals.indexOf(target);
      if (idx < 0) continue;
      if (!canCross(card.checked[c], s.locked[c], idx)) continue;
      // Cost = number of skipped cells from current rightmost to this index.
      const rm = rightmostChecked(card.checked[c]);
      const skip = idx - rm - 1;
      if (!best || skip < best.cost) best = { color: c, index: idx, cost: skip };
    }
    return best ? { color: best.color, index: best.index } : null;
  };

  const evalColor = (): { color: Color; index: number } | null => {
    let best: { color: Color; index: number; cost: number } | null = null;
    for (const c of COLORS) {
      if (s.locked[c]) continue;
      const cv = s.colorDice[c];
      const sums = [s.whiteDice[0] + cv, s.whiteDice[1] + cv];
      const card = s.players[aiIdx];
      if (!card) continue;
      for (const sum of sums) {
        const vals = ROW_VALUES[c];
        const idx = vals.indexOf(sum);
        if (idx < 0) continue;
        if (!canCross(card.checked[c], s.locked[c], idx)) continue;
        const rm = rightmostChecked(card.checked[c]);
        const skip = idx - rm - 1;
        if (!best || skip < best.cost) best = { color: c, index: idx, cost: skip };
      }
    }
    return best ? { color: best.color, index: best.index } : null;
  };

  // Easy CPUs are more reckless (will accept large skips); normal won't skip 4+.
  const allowSkip = s.settings.cpuLevel === "easy" ? 99 : 3;

  const wpick = evalWhite();
  if (wpick) {
    const card = s.players[aiIdx];
    if (card) {
      const rm = rightmostChecked(card.checked[wpick.color]);
      const skip = wpick.index - rm - 1;
      if (skip <= allowSkip) {
        const after = attemptWhiteCross(s, aiIdx, wpick.color, wpick.index);
        if (after) {
          s = { ...after, lastEvent: `P${aiIdx + 1} marked ${wpick.color} ${ROW_VALUES[wpick.color][wpick.index] ?? "?"}` };
        }
      }
    }
  }

  const cpick = evalColor();
  if (cpick) {
    const card = s.players[aiIdx];
    if (card) {
      const rm = rightmostChecked(card.checked[cpick.color]);
      const skip = cpick.index - rm - 1;
      if (skip <= allowSkip) {
        const after = attemptColorCross(s, cpick.color, cpick.index);
        if (after) {
          s = { ...after, lastEvent: `P${aiIdx + 1} marked ${cpick.color} ${ROW_VALUES[cpick.color][cpick.index] ?? "?"} (color)` };
        }
      }
    }
  }

  // CPU non-active turns: also let them try the white sum once if they happen
  // to be sitting non-active. (Handled separately via cpuStep when not active.)
  return endTurnTransition(s);
}

/** When a CPU is non-active (someone else rolled), give it a chance at the
 *  white sum. This runs immediately on roll for all non-active CPUs. */
function cpuPassiveWhites(state: QwixxFullState): QwixxFullState {
  let s = state;
  for (let p = 0; p < s.players.length; p++) {
    if (p === 0) continue;            // human chooses for themselves
    if (p === s.active) continue;     // active CPU handled in cpuChooseAndApply
    if (s.whiteActed[p]) continue;
    const target = s.whiteDice[0] + s.whiteDice[1];
    // Greedy: pick the smallest skip among all colors for this CPU.
    let best: { color: Color; index: number; cost: number } | null = null;
    for (const c of COLORS) {
      if (s.locked[c]) continue;
      const card = s.players[p];
      if (!card) continue;
      const vals = ROW_VALUES[c];
      const idx = vals.indexOf(target);
      if (idx < 0) continue;
      if (!canCross(card.checked[c], s.locked[c], idx)) continue;
      const rm = rightmostChecked(card.checked[c]);
      const skip = idx - rm - 1;
      if (!best || skip < best.cost) best = { color: c, index: idx, cost: skip };
    }
    // Passive CPUs are very conservative — only mark if 0 skip OR locking.
    const conservative = s.settings.cpuLevel === "easy" ? 2 : 1;
    if (best && best.cost <= conservative) {
      const after = attemptWhiteCross(s, p, best.color, best.index);
      if (after) s = after;
    }
  }
  return s;
}

export function reducer(
  state: QwixxFullState,
  action: QwixxFullAction,
): QwixxFullState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;
      const { whiteDice, colorDice, nextSeed: ns } = rollAll(state.rngSeed);
      let next: QwixxFullState = {
        ...state,
        rngSeed: ns,
        whiteDice,
        colorDice,
        phase: "rolled",
        activeMadeWhiteMark: false,
        activeMadeColorMark: false,
        whiteActed: [false, false, false],
        activePassedColor: false,
        rollCount: state.rollCount + 1,
        lastEvent: `P${state.active + 1} rolled (W ${whiteDice[0]}+${whiteDice[1]})`,
      };
      // Let non-active CPUs take their (optional) white mark right away.
      next = cpuPassiveWhites(next);
      return next;
    }

    case "markWhite": {
      const { player, color, index } = action;
      const next = attemptWhiteCross(state, player, color, index);
      return next ?? state;
    }

    case "markColor": {
      const { color, index } = action;
      const next = attemptColorCross(state, color, index);
      return next ?? state;
    }

    case "skipColor": {
      if (state.phase !== "rolled") return state;
      if (state.active !== 0) return state; // only human uses this
      return { ...state, activePassedColor: true };
    }

    case "takePenalty": {
      if (state.phase !== "rolled") return state;
      if (state.active !== 0) return state;
      if (state.activeMadeWhiteMark || state.activeMadeColorMark) return state;
      const card = state.players[0];
      if (!card) return state;
      const newPlayers = state.players.slice();
      newPlayers[0] = { ...card, penalties: card.penalties + 1 };
      const s: QwixxFullState = { ...state, players: newPlayers, lastEvent: "You took a penalty" };
      if (gameDone(s)) return { ...s, phase: "done" };
      const next = (s.active + 1) % s.players.length;
      return {
        ...s,
        active: next,
        phase: "preRoll",
        activeMadeWhiteMark: false,
        activeMadeColorMark: false,
        whiteActed: [false, false, false],
        activePassedColor: false,
        whiteDice: [0, 0],
        colorDice: { red: 0, yellow: 0, green: 0, blue: 0 },
      };
    }

    case "endTurn": {
      if (state.phase !== "rolled") return state;
      if (state.active !== 0) return state;
      return endTurnTransition(state);
    }

    case "cpuStep": {
      if (state.active === 0) return state;
      if (state.phase === "preRoll") {
        // CPU rolls.
        return reducer(state, { type: "roll" });
      }
      // Phase === "rolled", active is a CPU — pick and apply, then end turn.
      return cpuChooseAndApply(state);
    }

    default:
      return state;
  }
}

export function calcScore(state: QwixxFullState, playerIdx: number): number {
  const card = state.players[playerIdx];
  if (!card) return 0;
  let total = 0;
  for (const c of COLORS) {
    const base = crossCount(card.checked[c]);
    const bonus = card.checked[c][ROW_LEN - 1] ? 1 : 0; // lock cell = +1 cross
    total += rowScore(base + bonus);
  }
  total -= card.penalties * 5;
  return total;
}

export function isTerminal(state: QwixxFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, calcScore(state, 0)) };
}
