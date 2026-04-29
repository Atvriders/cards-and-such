import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeadOfWinterSurvivalState, DeadOfWinterSurvivalAction, DeadOfWinterSurvivalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeadOfWinterSurvivalGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const deadOfWinterSurvivalPlugin: GamePlugin<DeadOfWinterSurvivalState, DeadOfWinterSurvivalAction, typeof settings> = {
  id: "dead-of-winter-survival",
  title: "Dead of Winter: Survival",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Semi-coop zombie survival variant — crossroads add moral dilemmas.",
  howToPlay: "Dead of Winter: Survival distills the semi-cooperative zombie thriller. You play a colony survivor; an AI ally clears zombies. Combined dice across ten rounds represent food, morale, and zombie clearance. Aim for 70 to keep the colony alive through winter.\n\nPress Play Round to scavenge or fight. Then press Next Round, or Finish on round 10.\n\nIn the boxed game, betrayal cards add a hidden traitor element; this distillation excludes the betrayal so you can focus on survival. The Survival Bonus rewards careful resource use. Your AI ally's dice represent loyalty and competence — sometimes brilliant, sometimes a stumble. The walkers are at the gate. Bar the door. Trust your team.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeadOfWinterSurvivalSettings),
  reducer, isTerminal, component: DeadOfWinterSurvivalGame,
};
