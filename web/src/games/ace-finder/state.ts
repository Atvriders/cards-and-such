import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Ace Finder: 4 cards face down, one is an Ace. Pick the Ace!
// Win: 25 pts. Hint (flip one non-ace): -5 pts penalty. 5 rounds.

export interface AceFinderSettings {
  rounds: "5" | "10";
}

export interface AceFinderState {
  round: number;
  maxRounds: number;
  cards: number[];       // 4 card indices, one is an ace
  acePos: number;        // which position (0-3) holds the ace
  revealed: boolean[];   // which cards face up
  picked: number | null; // player's pick
  hintUsed: boolean;
  score: number;
  phase: "picking" | "result" | "gameover";
  rngSeed: number;
}

export type AceFinderAction =
  | { type: "pick"; pos: number }
  | { type: "hint" }
  | { type: "next" };

function cardName(c: number): string {
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suits = ["♠", "♥", "♦", "♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export { cardName };

function makeRound(seed: number): { cards: number[]; acePos: number; nextSeed: number } {
  const rng = mulberry32(seed);
  // Pick 4 distinct non-ace cards + 1 ace
  const nonAces = Array.from({ length: 48 }, (_, i) => i).filter(c => c % 13 !== 12);
  const shuffled: number[] = [...nonAces];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const three = shuffled.slice(0, 3);
  const aceIndex = Math.floor(rng() * 4) * 13 + 12; // one of 4 suits' aces
  const acePos = Math.floor(rng() * 4);
  const cards: number[] = [];
  let ni = 0;
  for (let i = 0; i < 4; i++) { if (i === acePos) cards.push(aceIndex); else cards.push(three[ni++]!); }
  return { cards, acePos, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: AceFinderSettings): AceFinderState {
  const { cards, acePos, nextSeed } = makeRound(seed);
  return {
    round: 1, maxRounds: parseInt(settings.rounds, 10),
    cards, acePos, revealed: [false, false, false, false],
    picked: null, hintUsed: false, score: 0,
    phase: "picking", rngSeed: nextSeed,
  };
}

export function reducer(state: AceFinderState, action: AceFinderAction): AceFinderState {
  if (state.phase === "gameover") return state;
  if (action.type === "hint") {
    if (state.phase !== "picking" || state.hintUsed) return state;
    // Reveal a non-ace card that hasn't been revealed yet
    const candidates = [0, 1, 2, 3].filter(i => i !== state.acePos && !state.revealed[i]);
    if (candidates.length === 0) return state;
    const revealIdx = candidates[0]!;
    const revealed = [...state.revealed];
    revealed[revealIdx] = true;
    return { ...state, revealed, hintUsed: true };
  }
  if (action.type === "pick") {
    if (state.phase !== "picking" || state.picked !== null) return state;
    const win = action.pos === state.acePos;
    const pts = win ? (state.hintUsed ? 20 : 25) : 0;
    const revealed = [true, true, true, true];
    const phase = state.round >= state.maxRounds ? "gameover" : "result";
    return { ...state, picked: action.pos, revealed, score: state.score + pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const { cards, acePos, nextSeed } = makeRound(state.rngSeed);
    return { ...state, round: state.round + 1, cards, acePos, revealed: [false, false, false, false], picked: null, hintUsed: false, phase: "picking", rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: AceFinderState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
