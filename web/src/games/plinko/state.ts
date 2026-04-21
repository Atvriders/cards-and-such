import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ChipPath {
  /** Left/right decisions at each row (false=left, true=right), length = rows */
  decisions: readonly boolean[];
  /** Final slot index (0 = leftmost) */
  slot: number;
  /** Points earned */
  points: number;
}

export interface PlinkoState {
  settings: { chips: "5" | "10" | "20"; rows: "8" | "12" | "16" };
  totalChips: number;
  chipsUsed: number;
  score: number;
  /** Slot point values, length = rows + 1 */
  slotValues: readonly number[];
  /** History of chips that have been dropped */
  history: readonly ChipPath[];
  /** Currently animating chip (null when idle) */
  animating: ChipPath | null;
  rngSeed: number;
  rngCounter: number;
}

export type PlinkoAction =
  | { type: "drop" };

/** Build slot values: center highest, outer lowest */
function buildSlotValues(rows: number): number[] {
  const numSlots = rows + 1;
  const vals: number[] = [];
  // Values from outer to center: 5, 10, 25, 50, 100...
  const template = [5, 10, 25, 50, 100, 200, 500];
  const half = Math.floor(numSlots / 2);
  for (let i = 0; i < numSlots; i++) {
    const distFromCenter = Math.abs(i - half);
    const idx = Math.min(half - distFromCenter, template.length - 1);
    vals.push(template[idx]!);
  }
  return vals;
}

export function initialState(
  seed: number,
  settings: { chips: "5" | "10" | "20"; rows: "8" | "12" | "16" },
): PlinkoState {
  const rows = parseInt(settings.rows, 10);
  const chips = parseInt(settings.chips, 10);
  return {
    settings,
    totalChips: chips,
    chipsUsed: 0,
    score: 0,
    slotValues: buildSlotValues(rows),
    history: [],
    animating: null,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: PlinkoState, action: PlinkoAction): PlinkoState {
  switch (action.type) {
    case "drop": {
      if (state.chipsUsed >= state.totalChips) return state;

      const rows = parseInt(state.settings.rows, 10);
      const rng = mulberry32(state.rngSeed + state.rngCounter * 999983);
      const decisions: boolean[] = [];
      let slot = 0;
      for (let r = 0; r < rows; r++) {
        const goRight = rng() < 0.5;
        decisions.push(goRight);
        if (goRight) slot++;
      }
      const points = state.slotValues[slot] ?? 0;
      const chip: ChipPath = { decisions, slot, points };

      return {
        ...state,
        animating: chip,
        chipsUsed: state.chipsUsed + 1,
        score: state.score + points,
        history: [...state.history, chip],
        rngCounter: state.rngCounter + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PlinkoState): { score: number } | null {
  if (state.chipsUsed < state.totalChips) return null;
  return { score: state.score };
}
