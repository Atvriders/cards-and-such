import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogwartsVillainCoopState, HogwartsVillainCoopAction, HogwartsVillainCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HogwartsVillainCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hogwartsVillainCoopPlugin: GamePlugin<HogwartsVillainCoopState, HogwartsVillainCoopAction, typeof settings> = {
  id: "hogwarts-villain-coop",
  title: "Hogwarts: Villain Chapter",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative deck builder variant — defeat villain chapter by chapter.",
  howToPlay: "Hogwarts: Villain Chapter is a cooperative deck builder distillation. You play a Hogwarts student with an AI ally. Combined dice across ten rounds represent spells cast, allies summoned, and items wielded. Hit 65 to defeat the villain and earn the Chapter Bonus.\n\nPress Play Round to draw and cast. Then press Next Round, or Finish on round 10.\n\nIn the boxed Hogwarts Battle, each book is a chapter with escalating difficulty; this distillation captures one chapter's worth of villain trouble. Your AI ally provides essential support — sometimes a Stupefy, sometimes a Wingardium Leviosa. The Chapter Bonus rewards strong synergy. Wave your wand. Roll the dice. Vanquish the dark wizard.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HogwartsVillainCoopSettings),
  reducer, isTerminal, component: HogwartsVillainCoopGame,
};
