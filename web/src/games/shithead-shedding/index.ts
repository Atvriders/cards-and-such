import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShitheadSheddingState, ShitheadSheddingAction, ShitheadSheddingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShitheadSheddingGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const shitheadSheddingPlugin: GamePlugin<ShitheadSheddingState, ShitheadSheddingAction, typeof settings> = {
  id: "shithead-shedding", title: "Shithead", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-tier shedding game where you must play equal or higher than the top card.",
  howToPlay: "Shithead, also called Karma, is a brutal shedding card game from British pubs. In this stripped-down version each player gets a hand of seven cards. On your turn you must play a card that is equal to or higher than the rank on top of the discard pile. Twos are wild and reset the pile; tens burn the pile and give you another turn. If you cannot play, you must pick up the entire discard pile.\n\nThe first player to empty their hand wins the round. Six rounds are played and the loser of each round (the Shithead) goes nothing for that round. The winner scores twenty points plus five for every card the loser still holds.\n\nThe hardest part is dodging an avalanche of cards from a single bad draw. Twos are precious — saved twos can rescue a stuck hand. A typical six-round run scores around sixty to ninety points; a hot night with several wild twos can double that.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShitheadSheddingSettings),
  reducer, isTerminal, component: ShitheadSheddingGame,
};
