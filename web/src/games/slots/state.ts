import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SlotsSettings {
  betSize: "1" | "5" | "10";
  maxSpins: "20" | "50" | "100";
}

export type SlotSymbol = "cherry" | "lemon" | "orange" | "plum" | "bell" | "bar" | "seven";

// Each reel has 20 positions. Distribution skews toward cheaper symbols.
const REEL: SlotSymbol[] = [
  "cherry", "cherry", "cherry", "cherry",
  "lemon", "lemon", "lemon", "lemon",
  "orange", "orange", "orange",
  "plum", "plum", "plum",
  "bell", "bell",
  "bar", "bar",
  "seven",
  "seven",
];

export interface SlotsState {
  settings: SlotsSettings;
  rngSeed: number;
  credits: number;
  spinsPlayed: number;
  reels: [SlotSymbol, SlotSymbol, SlotSymbol] | null;
  lastResult: string;
  phase: "idle" | "result";
}

export type SlotsAction = { type: "spin" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function evaluateReels(reels: [SlotSymbol, SlotSymbol, SlotSymbol], bet: number): number {
  const [a, b, c] = reels;

  // 3 of a kind payouts
  if (a === b && b === c) {
    switch (a) {
      case "seven": return bet * 100;
      case "bar":   return bet * 25;
      case "bell":  return bet * 10;
      case "cherry":return bet * 5;
      case "lemon":
      case "orange":
      case "plum":  return bet * 2;
    }
  }

  // 2 cherries anywhere
  const cherryCount = reels.filter((s) => s === "cherry").length;
  if (cherryCount >= 2) return bet * 1;

  return 0;
}

export function resultDescription(reels: [SlotSymbol, SlotSymbol, SlotSymbol], bet: number): string {
  const payout = evaluateReels(reels, bet);
  const [a, b, c] = reels;

  if (a === b && b === c) {
    const sym = a;
    if (sym === "seven") return `JACKPOT! 777! +${payout} credits`;
    return `Three ${sym}s! +${payout} credits`;
  }

  const cherryCount = reels.filter((s) => s === "cherry").length;
  if (cherryCount >= 2) return `Two cherries! +${payout} credits`;

  return `${a} | ${b} | ${c} — No win.`;
}

export function initialState(seed: number, settings: SlotsSettings): SlotsState {
  return {
    settings,
    rngSeed: seed,
    credits: 100,
    spinsPlayed: 0,
    reels: null,
    lastResult: "",
    phase: "idle",
  };
}

export function reducer(state: SlotsState, action: SlotsAction): SlotsState {
  if (action.type !== "spin") return state;

  const maxSpins = parseInt(state.settings.maxSpins, 10);
  const bet = parseInt(state.settings.betSize, 10);

  if (state.spinsPlayed >= maxSpins) return state;
  if (state.credits < bet) return state;

  const { rng, nextSeed } = advanceSeed(state.rngSeed);

  const r1 = REEL[Math.floor(rng() * REEL.length)] as SlotSymbol;
  const r2 = REEL[Math.floor(rng() * REEL.length)] as SlotSymbol;
  const r3 = REEL[Math.floor(rng() * REEL.length)] as SlotSymbol;
  const reels: [SlotSymbol, SlotSymbol, SlotSymbol] = [r1, r2, r3];

  const payout = evaluateReels(reels, bet);
  const credits = state.credits - bet + payout;
  const lastResult = resultDescription(reels, bet);

  return {
    ...state,
    rngSeed: nextSeed,
    credits: Math.max(0, credits),
    spinsPlayed: state.spinsPlayed + 1,
    reels,
    lastResult,
    phase: "result",
  };
}

export function isTerminal(state: SlotsState): { score: number } | null {
  const maxSpins = parseInt(state.settings.maxSpins, 10);
  if (
    state.phase === "result" &&
    (state.spinsPlayed >= maxSpins || state.credits < parseInt(state.settings.betSize, 10))
  ) {
    return { score: state.credits };
  }
  return null;
}

export const SYMBOL_EMOJI: Record<SlotSymbol, string> = {
  cherry: "🍒",
  lemon: "🍋",
  orange: "🍊",
  plum: "🍇",
  bell: "🔔",
  bar: "BAR",
  seven: "7",
};
