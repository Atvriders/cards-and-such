import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ninepinsClassicPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "ninepins-classic",
  title: "Ninepins (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Diamond formation, no headpin removal rule.",
  howToPlay: "Ninepins (Classic) uses the historic diamond-arrangement of nine pins with the classical 'no headpin' bonus rule: knocking down all 8 corners while leaving the headpin standing scores 12 instead of 8. Across ten throws press Throw; a random outcome decides pins fallen 0-9. About 18% chance of strike (9 pins for 9 points), 8% chance of headpin-spare (8 corners only for 12 points), 24% chance of 6-7 pins, 25% of 4-5, 25% of 0-3. The CPU throws simultaneously each round. Total points after ten throws wins. Ninepins predates tenpin bowling by centuries, banned in 19th-century America — leading to ten-pin's invention as a workaround. The diamond arrangement and headpin bonus survive in some German Kegel clubs and historic American alleys. Press Throw to advance; the special headpin scores are highlighted. Final scoreboard awards 100 points for the win, 25 for a tie. The headpin bonus makes ninepins more strategic in real play; here it's another fortune-driven outcome.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
