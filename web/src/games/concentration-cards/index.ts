import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConcentrationCardsState, ConcentrationCardsAction, ConcentrationCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConcentrationCardsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const concentrationCardsPlugin: GamePlugin<ConcentrationCardsState, ConcentrationCardsAction, typeof settings> = {
  id: "concentration-cards", title: "Concentration", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Memory game: pair up matching ranks against the CPU.",
  howToPlay: "Concentration — also called Memory — is the classic face-down pair-finding game. This mini-version frames it as luck: each round, you flip two cards from a fresh deck, and the CPU also flips two. Whoever's pair is closer in rank wins the round.\n\nEach round, four cards total are flipped (your two and CPU's two). Each side's \"score for the round\" is the absolute rank-difference of their pair: a perfect pair (matching ranks) is 0 (best), a wide spread is bad. The lower pair-difference wins the round.\n\nScoring: round win awards 14 points. Tie awards 5 sympathy points. Loss awards zero.\n\nEight rounds total. Expected score is around 50-70 points. Hitting an exact same-rank pair (a real \"match\") gives you the round almost certainly.\n\nReal Concentration is about memory and turn-by-turn flipping. This mini version captures the satisfying click of two close-rank cards landing together. Quick, light, and slightly bittersweet when the CPU's pair lines up perfectly while yours is split by a king.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConcentrationCardsSettings),
  reducer, isTerminal, component: ConcentrationCardsGame,
};
