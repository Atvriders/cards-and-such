import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BurgleBrosMultiState, BurgleBrosMultiAction, BurgleBrosMultiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BurgleBrosMultiGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const burgleBrosMultiPlugin: GamePlugin<BurgleBrosMultiState, BurgleBrosMultiAction, typeof settings> = {
  id: "burgle-bros-multi",
  title: "Burgle Bros: Multi-Heist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative heist variant — multi-floor bank with rotating safes.",
  howToPlay: "Burgle Bros: Multi-Heist is a cooperative bank heist across three floors. You play a thief alongside an AI accomplice. Combined dice represent stealth versus alarm risk. Across ten rounds aim to score 75 to escape with the loot.\n\nPress Play Round to crack a safe. Then press Next Round, or Finish on round 10.\n\nIn the boxed game, guards patrol on a track and safes have crack codes; this distillation abstracts those mechanics into stealth dice. Your AI accomplice always has your back, but only as far as their own dice allow. The Multi-Heist Bonus rewards a clean exit. Stay quiet, crack fast, run faster.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BurgleBrosMultiSettings),
  reducer, isTerminal, component: BurgleBrosMultiGame,
};
