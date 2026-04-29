import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicMultistepState, PandemicMultistepAction, PandemicMultistepSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicMultistepGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicMultistepPlugin: GamePlugin<PandemicMultistepState, PandemicMultistepAction, typeof settings> = {
  id: "pandemic-multistep",
  title: "Pandemic: Multistep Cure",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pandemic variant — cure discovery requires multi-step lab actions.",
  howToPlay: "Pandemic: Multistep Cure adapts the Pandemic In the Lab expansion. You play a CDC researcher with an AI scientist. Combined dice across ten rounds represent samples, mutations, and partial cures. Hit 70 to fully cure the disease and earn the Multistep Bonus.\n\nPress Play Round to act in the lab. Then press Next Round, or Finish on round 10.\n\nIn the boxed Pandemic In the Lab, cures are no longer one-step but require multiple sample types collected from multiple cities; this distillation simulates that complexity through accumulated rolls. Your AI scientist works in parallel. The Bonus rewards complete cure pipelines. Outbreaks happen, viruses mutate, but research wins. Pipette steady. Roll high.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicMultistepSettings),
  reducer, isTerminal, component: PandemicMultistepGame,
};
