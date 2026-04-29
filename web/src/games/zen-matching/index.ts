import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZenMatchingState, ZenMatchingAction, ZenMatchingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZenMatchingGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zenMatchingPlugin: GamePlugin<ZenMatchingState, ZenMatchingAction, typeof settings> = {
  id: "zen-matching", title: "Zen Matching", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pair mandala patterns with their tranquil names.",
  howToPlay: "Zen Matching is the meditative cousin of speed-memory games. Each of fifteen rounds presents a poetic mandala-name description (Eight petals around center, Radiating golden rays, Wave bands curving) and asks you to pick the matching name from four candidates. The pool of ten mandala patterns includes Lotus Bloom, Sunburst, River Flow, Mountain Peak, Forest Canopy, Star Path, Ocean Depths, Desert Wind, Cherry Blossom, and Bamboo Grove. Correct answers score ten points; max total 150 across fifteen rounds. There is no timer — slowness is a feature. Read each description carefully and visualize the pattern before picking. The game rewards mindful attention to detail and aesthetic intuition rather than speed. Solid players score 130+; intuitive ones can hit 150 perfect. Hit Submit to lock, then Next to advance. Use as a calm warm-down between adrenaline games or a slow-paced meditation aid.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZenMatchingSettings),
  reducer, isTerminal, component: ZenMatchingGame,
};
