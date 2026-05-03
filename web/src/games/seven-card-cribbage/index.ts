import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenCardCribbageState, SevenCardCribbageAction, SevenCardCribbageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenCardCribbageGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: SevenCardCribbageState): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const sevenCardCribbagePlugin: GamePlugin<SevenCardCribbageState, SevenCardCribbageAction, typeof settings> = {
  id: "seven-card-cribbage", title: "Seven-Card Cribbage", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Extended seven-card-hand Cribbage as an extended cut-comparison race.",
  howToPlay: "Seven-Card Cribbage is a less-common longer variant where each player is dealt seven cards instead of six. The expanded hand makes for higher individual scoring but slower pace, so this version stretches across twelve rounds with a smaller per-round peg payout.\n\nEach round, you and the CPU each cut one card from a shared 52-card deck. Higher rank wins. Aces are 1, face cards are 11/12/13. Suit is irrelevant.\n\nScoring: cut win pegs 8 points (smaller because there are more rounds). Tie pegs 3 points sympathy. Loss pegs zero. Twelve rounds approximate a complete seven-card cribbage match.\n\nExpected total is around 60-80 points. Above 100 points requires winning roughly two-thirds of cuts — luck-dependent. The slower pace gives more time to mathematically settle near the average.\n\nThere are no decisions to make and no melds to track — just the cut. This is a fast tribute to the rare seven-card form played in some 19th-century English clubs and family parlors.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenCardCribbageSettings),
  reducer, isTerminal, hint, component: SevenCardCribbageGame,
};
