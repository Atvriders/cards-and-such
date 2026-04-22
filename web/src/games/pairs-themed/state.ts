import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const THEMES = {
  animals: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🦖"],
  flags: ["🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇮🇹","🇯🇵","🇰🇷","🇨🇳","🇧🇷","🇮🇳","🇷🇺","🇨🇦","🇦🇺","🇲🇽","🇪🇸","🇵🇹","🇳🇱","🇧🇪","🇸🇪","🇳🇴","🇩🇰","🇫🇮","🇨🇭","🇦🇹","🇵🇱","🇨🇿","🇭🇺","🇬🇷","🇹🇷","🇸🇦","🇦🇷","🇨🇱","🇨🇴","🇵🇪","🇿🇦","🇳🇬","🇪🇬","🇮🇱","🇹🇭","🇻🇳"],
  planets: ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","🌙","🌛","🌜","☀️","🌟","⭐","🌠","🌌","🔭","🪐","🌍","🌎","🌏","☄️","🛸","🚀","🛰️","🪨","💫","✨","🌤️","⛅","🌥️","🌦️","🌈","⚡","🌩️","🌪️","🌫️","🌬️","❄️","🌊"],
  music: ["🎵","🎶","🎸","🎹","🎺","🎻","🥁","🎷","🎙️","🎚️","🎛️","📻","🎤","🎧","🎼","🎭","🎪","🎨","🎬","🎤","🎯","🃏","🎲","🎮","🕹️","🎰","🎳","🎯","🎿","⛷️","🏂","🏋️","🤼","🏊","🚴","🏇","🥊","🤺","🤸","🎣"],
};

export type ThemeKey = keyof typeof THEMES;

export interface PairsThemedState {
  settings: { theme: ThemeKey; size: "12" | "16" | "24" | "36" };
  rows: number;
  cols: number;
  symbols: string[];
  state: ("hidden" | "flipped" | "matched")[];
  firstFlipped: number | null;
  attempts: number;
  matched: number;
  won: boolean;
  pendingMismatch: [number, number] | null;
}

export type PairsAction =
  | { type: "flip"; index: number }
  | { type: "dismiss-mismatch" };

const GRID_DIMS: Record<string, { rows: number; cols: number }> = {
  "12": { rows: 3, cols: 4 },
  "16": { rows: 4, cols: 4 },
  "24": { rows: 4, cols: 6 },
  "36": { rows: 6, cols: 6 },
};

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!; a[i] = a[j]!; a[j] = tmp;
  }
  return a;
}

export function initialState(
  seed: number,
  settings: { theme: ThemeKey; size: "12" | "16" | "24" | "36" },
): PairsThemedState {
  const rng = mulberry32(seed);
  const pairs = parseInt(settings.size, 10);
  const { rows, cols } = GRID_DIMS[settings.size]!;
  const pool = THEMES[settings.theme];
  const chosen = seededShuffle([...pool], rng).slice(0, pairs);
  const cards = seededShuffle([...chosen, ...chosen], rng);

  return {
    settings,
    rows,
    cols,
    symbols: cards,
    state: Array(rows * cols).fill("hidden"),
    firstFlipped: null,
    attempts: 0,
    matched: 0,
    won: false,
    pendingMismatch: null,
  };
}

export function reducer(state: PairsThemedState, action: PairsAction): PairsThemedState {
  switch (action.type) {
    case "dismiss-mismatch": {
      if (!state.pendingMismatch) return state;
      const [a, b] = state.pendingMismatch;
      const newCellState = state.state.slice() as PairsThemedState["state"];
      newCellState[a] = "hidden";
      newCellState[b] = "hidden";
      return { ...state, state: newCellState, pendingMismatch: null };
    }

    case "flip": {
      if (state.won) return state;
      let current = state;

      if (current.pendingMismatch) {
        const [a, b] = current.pendingMismatch;
        const newCellState = current.state.slice() as PairsThemedState["state"];
        newCellState[a] = "hidden";
        newCellState[b] = "hidden";
        current = { ...current, state: newCellState, pendingMismatch: null };
      }

      const { index } = action;
      if (current.state[index] !== "hidden") return current;

      const newCellState = current.state.slice() as PairsThemedState["state"];
      newCellState[index] = "flipped";

      if (current.firstFlipped === null) {
        return { ...current, state: newCellState, firstFlipped: index };
      }

      const firstIdx = current.firstFlipped;
      const pairs = parseInt(current.settings.size, 10);

      if (current.symbols[index] === current.symbols[firstIdx]) {
        newCellState[firstIdx] = "matched";
        newCellState[index] = "matched";
        const newMatched = current.matched + 1;
        const won = newMatched === pairs;
        return {
          ...current,
          state: newCellState,
          firstFlipped: null,
          attempts: current.attempts + 1,
          matched: newMatched,
          won,
        };
      } else {
        return {
          ...current,
          state: newCellState,
          firstFlipped: null,
          attempts: current.attempts + 1,
          pendingMismatch: [firstIdx, index],
        };
      }
    }

    default:
      return state;
  }
}

export function isTerminal(state: PairsThemedState): { score: number } | null {
  if (!state.won) return null;
  const pairs = parseInt(state.settings.size, 10);
  return { score: Math.max(100, pairs * 200 - (state.attempts - pairs) * 20) };
}
