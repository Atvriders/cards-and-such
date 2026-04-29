import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VastMysteriousCoopState, VastMysteriousCoopAction, VastMysteriousCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VastMysteriousCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const vastMysteriousCoopPlugin: GamePlugin<VastMysteriousCoopState, VastMysteriousCoopAction, typeof settings> = {
  id: "vast-mysterious-coop",
  title: "Vast: Mysterious Manor",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asymmetric haunted house cooperative — ghosts, paladin, skeletons.",
  howToPlay: "Vast: Mysterious Manor is an asymmetric cooperative haunted house simulation. You play a paladin alongside an AI ghost ally exploring a moving manor. Across ten rounds, combined dice resolve room exploration, ghost binding, and skeleton rebuke.\n\nPress Play Round to explore a room. Then press Next Round, or Finish on round 10. Hit 65 to lay the manor's spirits to rest and claim the Mysterious bonus.\n\nIn the boxed game, every player has different rules; this distillation gives you the paladin perspective and the AI takes a ghost role. The manor itself shifts, threats lurk in dark corners, and the only way out is together. Mind the floorboards. Listen for the wail.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as VastMysteriousCoopSettings),
  reducer, isTerminal, component: VastMysteriousCoopGame,
};
