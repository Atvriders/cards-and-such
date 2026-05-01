import { newDeck, shuffle, type Card } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AccordionSolitaireSettings { _dummy?: undefined }

export interface AccordionSolitaireState {
  cards: (Card | null)[];
  movesMade: number;
  score: number;
  won: boolean;
}

export type AccordionSolitaireAction = { type: "collapse"; from: number; to: number };

export function initialState(seed: number, _s: AccordionSolitaireSettings): AccordionSolitaireState {
  void _s;
  const deck = shuffle(newDeck(), mulberry32(seed));
  return { cards: deck, movesMade: 0, score: 0, won: false };
}

function compact(arr: (Card | null)[]): Card[] {
  return arr.filter((c): c is Card => c !== null);
}

export function reducer(state: AccordionSolitaireState, action: AccordionSolitaireAction): AccordionSolitaireState {
  if (state.won) return state;
  if (action.type !== "collapse") return state;
  const live = compact(state.cards);
  const { from, to } = action;
  if (from === to) return state;
  if (from < 0 || to < 0 || from >= live.length || to >= live.length) return state;
  // Allow collapse to position to either 1 or 3 left.
  const dist = from - to;
  if (dist !== 1 && dist !== 3) return state;
  const a = live[from]!;
  const b = live[to]!;
  if (a.suit !== b.suit && a.rank !== b.rank) return state;
  // a moves on top of b — replace position to with a, drop position from.
  const out = [...live];
  out[to] = a;
  out.splice(from, 1);
  const won = out.length === 1;
  return {
    ...state,
    cards: out,
    movesMade: state.movesMade + 1,
    score: state.score + 5,
    won,
  };
}

export function isTerminal(s: AccordionSolitaireState): { score: number } | null {
  return s.won ? { score: s.score } : null;
}
