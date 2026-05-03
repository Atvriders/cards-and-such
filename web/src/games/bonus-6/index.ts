import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Bonus6State, Bonus6Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Bonus6Game } from "./Game.js";

export const bonus6Settings = {
  bet: {
    kind: "enum" as const,
    label: "Bet per Spin",
    options: ["1", "5", "10", "25"] as const,
    default: "5",
  },
  spinsPerSession: {
    kind: "number" as const,
    label: "Spins per Session",
    min: 10,
    max: 100,
    step: 10,
    default: 30,
  },
} as const;

type Settings = SettingsOf<typeof bonus6Settings>;

export const bonus6Plugin: GamePlugin<Bonus6State, Bonus6Action, typeof bonus6Settings> = {
  id: "bonus-6",
  title: "Bonus 6",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roulette proposition bet: will the spin contain the digit 6? Pays 6:1.",
  howToPlay: `Bonus 6 is a roulette proposition side bet focused on a single thrilling question: will the spin result contain the digit 6?

How to play: Place your bet, then spin the roulette wheel (numbers 0–36). If the winning number contains a 6 — that means 6, 16, 26, or 36 — your bet pays out at 6:1. You receive your original bet back plus six times your stake. Any other result loses your bet.

The math: Out of 37 possible outcomes (0–36), exactly four contain the digit 6. This gives a probability of about 10.8% per spin. With a 6:1 payout on a roughly 1-in-9.25 event, the house retains an edge.

Eligible numbers: 6, 16, 26, 36. All other numbers — including 0, 1–5, 7–15, 17–25, 27–35 — lose.

This is a pure luck game with no strategy component. It is best enjoyed as a fast-paced side attraction with small bets. The bet size and number of spins can be configured in Settings. Your starting bankroll is $500. Score equals your bankroll at session end.`,
  settings: bonus6Settings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: Bonus6State): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "betting") return { selector: '[data-testid="hint-target-bonus6-bet"]', pulses: 3 };
    if (state.phase === "spinning") return { selector: '[data-testid="hint-target-bonus6-spin"]', pulses: 3 };
    if (state.phase === "settled") return { selector: '[data-testid="hint-target-bonus6-next"]', pulses: 3 };
    return null;
  },
  component: Bonus6Game,
};
