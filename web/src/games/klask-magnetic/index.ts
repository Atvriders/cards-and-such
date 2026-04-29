import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlaskMagneticState, KlaskMagneticAction, KlaskMagneticSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KlaskMagneticGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const klaskMagneticPlugin: GamePlugin<KlaskMagneticState, KlaskMagneticAction, typeof settings> = {
  id: "klask-magnetic", title: "Klask Magnetic", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the magnet positioning that scores the goal.",
  howToPlay: "Klask Magnetic adapts the magnetic-air-hockey-style game's strategic positioning to a 4-choice puzzle. Each of twelve rounds shows you a goal-slot position (0 to 7) and asks which magnet placement scores. Pick the matching position from four candidates, hit Submit, score ten points. Max 120 points. The original Klask uses magnetic handles below a board to control mallets above — players score by sinking the ball in opponent goals. This digital version tests strategic spatial-position matching: which magnet placement aligns with the scoring goal. Spatial reasoners score 100+; first-timers 70-90. Hit Submit and Next to advance. Total run takes about a minute. Klask Magnetic is not a dexterity simulation — it is a position-matching drill for the ball-trajectory intuition. A perfect score certifies you understand the geometry well enough to play live Klask.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KlaskMagneticSettings),
  reducer, isTerminal, component: KlaskMagneticGame,
};
