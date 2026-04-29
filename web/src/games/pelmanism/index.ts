import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PelmanismState, PelmanismAction, PelmanismSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PelmanismGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pelmanismPlugin: GamePlugin<PelmanismState, PelmanismAction, typeof settings> = {
  id: "pelmanism", title: "Pelmanism", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British memory game (=Concentration); match pairs vs CPU.",
  howToPlay: "Pelmanism is the British name for Concentration, traditionally taught as a memory exercise to schoolchildren in the early 20th century. This mini-version stages it as luck: per round, you flip two cards and the CPU flips two; whoever's pair is more closely-ranked wins the round.\n\nEach round, four cards are revealed (your two and the CPU's two). Each side scores the round by the absolute difference between their pair ranks; lower difference wins. A matching-rank pair (difference 0) is the strongest possible result.\n\nScoring: round win awards 14 points. Tie awards 5 sympathy points. Loss awards zero.\n\nEight rounds per match. Expected score is around 50-70 points; lucky games where you flip an actual same-rank pair are most rewarding.\n\nPelmanism comes from Pelman Institute training programs of the 1900s that promoted \"scientific memory\" via card-pair drills. This mini honors that history without the actual memorization — the pairs are revealed simultaneously. Feels educational anyway.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PelmanismSettings),
  reducer, isTerminal, component: PelmanismGame,
};
