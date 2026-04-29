import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RobinsonIslandState, RobinsonIslandAction, RobinsonIslandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RobinsonIslandGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const robinsonIslandPlugin: GamePlugin<RobinsonIslandState, RobinsonIslandAction, typeof settings> = {
  id: "robinson-island",
  title: "Robinson Crusoe: Island Camp",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative survival variant — build camp, explore, forage.",
  howToPlay: "Robinson Crusoe: Island Camp is a cooperative survival distillation. You play a castaway alongside an AI companion building a camp on a deserted island. Combined dice across ten rounds represent foraging, shelter building, and morale.\n\nPress Play Round to take an action. Then press Next Round, or Finish on round 10. Hit 70 to fortify the camp and earn the Island Bonus.\n\nIn the boxed Robinson Crusoe, scenarios layer atop core survival rules; this distillation captures the basic anxiety of running out of food while a storm brews. Your AI companion gathers, hunts, hides. Keep morale high enough that neither of you breaks. Smoke signals drift skyward. Roll to be rescued.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RobinsonIslandSettings),
  reducer, isTerminal, component: RobinsonIslandGame,
};
