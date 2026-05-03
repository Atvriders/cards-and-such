import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TractorShengJiState, TractorShengJiAction, TractorShengJiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TractorShengJiGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: TractorShengJiState): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const tractorShengJiPlugin: GamePlugin<TractorShengJiState, TractorShengJiAction, typeof settings> = {
  id: "tractor-sheng-ji", title: "Tractor (Sheng Ji)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese partnership climbing game.",
  howToPlay: "Tractor, also called Sheng Ji ('Climb Levels'), is a Chinese partnership climbing card game played widely throughout China. Pairs of consecutive ranks form 'tractors' that beat smaller pairs.\n\nThis adaptation simulates a six-round head-to-head against the CPU. You lead each round with a single, pair, or tractor; the CPU responds. The strongest legal combination clears the trick, and the side that first empties wins twenty points plus five for each card the CPU still holds.\n\nTrump cards in Tractor follow the level being played — twos at level two, threes at level three, and so on. In this simplified version trump is fixed and the CPU plays competently most of the time. Expect close rounds.\n\nA good total across six rounds is sixty to one hundred. Tractor is one of the most-played games in China and the deep strategy of partnership signaling is captured here only as solo CPU rivalry, but the climbing tempo and rapid-fire trump pairs come through. Press Play to climb.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TractorShengJiSettings),
  reducer, isTerminal, hint, component: TractorShengJiGame,
};
