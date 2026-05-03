import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveCardCribbageState, FiveCardCribbageAction, FiveCardCribbageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveCardCribbageGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: FiveCardCribbageState): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const fiveCardCribbagePlugin: GamePlugin<FiveCardCribbageState, FiveCardCribbageAction, typeof settings> = {
  id: "five-card-cribbage", title: "Five-Card Cribbage", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Original 5-card-hand Cribbage as a quick peg-comparison game.",
  howToPlay: "Five-Card Cribbage was the original form of the game, played on a 61-board with five-card hands instead of the modern six. This mini-variant honors that with a higher per-round payout and fewer rounds.\n\nEach round, you and the CPU each cut one card from a 52-card deck. Higher card wins. Aces count as 1, face cards score by traditional rank. Suits don't matter.\n\nScoring: round win pegs 14 points (matching the higher per-deal scoring of five-card cribbage). Tie pegs 5 sympathy points. Loss pegs zero. Seven rounds simulate one complete trip around a 61-peg board.\n\nExpected score is around 50-75 points (you cut higher about half the time, tie roughly once per game). Streaks above 90 are very lucky. A loss-streak still ends with a respectable 25-30 points from ties.\n\nThis is the historical version that 17th-century English players knew. Modern six-card cribbage now dominates, but five-card games remain crisp and fast.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FiveCardCribbageSettings),
  reducer, isTerminal, hint, component: FiveCardCribbageGame,
};
