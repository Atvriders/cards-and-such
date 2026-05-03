import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PokerPatienceState, PokerPatienceAction, PokerPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PokerPatienceGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: PokerPatienceState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-poker-patience-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-poker-patience-secondary"]', pulses: 3 };
  return null;
};

export const pokerPatiencePlugin: GamePlugin<PokerPatienceState, PokerPatienceAction, typeof settings> = {
  id: "poker-patience", title: "Poker Patience", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Poker Squares: place cards to form poker hands. Random luck variant.",
  howToPlay: "Poker Patience — also called Poker Squares — is a 5×5 grid solitaire where you place 25 cards and score the 10 lines (5 rows + 5 columns) as poker hands. This mini-version reduces it to 10 luck-based \"lines\" against the CPU.\n\nEach round (each \"line\"), you and the CPU each draw one card. Higher rank wins (the line scored higher). Aces high (13), twos low (1). Suit is ignored.\n\nScoring: round win awards 11 points. Tie awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score: 50-70 points.\n\nReal Poker Patience requires careful strategic placement: a flush is worth 30, a straight 12, a full house 25 in standard scoring. The 5×5 grid is a tight constraint that makes every placement a tradeoff. This mini-version skips the placement and just compares cards round by round. A pure-luck framing of a strategic classic.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PokerPatienceSettings),
  reducer, isTerminal, hint: hint, component: PokerPatienceGame,
};
