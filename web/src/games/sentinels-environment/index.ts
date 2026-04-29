import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SentinelsEnvironmentState, SentinelsEnvironmentAction, SentinelsEnvironmentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SentinelsEnvironmentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sentinelsEnvironmentPlugin: GamePlugin<SentinelsEnvironmentState, SentinelsEnvironmentAction, typeof settings> = {
  id: "sentinels-environment",
  title: "Sentinels: Environment Chaos",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sentinels of the Multiverse variant — environment deck adds chaos.",
  howToPlay: "Sentinels: Environment Chaos pits you and your AI hero against a villain on a chaotic environment deck. Across ten rounds, combined dice represent damage output and environment mitigation. Cross 70 and the villain falls.\n\nPress Play Round to attack and defend. Then press Next Round, or Finish on round 10.\n\nIn the box, the environment deck triggers between turns and can help or hinder; this distillation gives the dice extra variance to simulate the environment swings. The Multiverse Bonus rewards a solid 70+ team total. Pick your hero theme — speedster, tank, or arcane — and roll. The villain has plans of his own, but your dice say otherwise.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SentinelsEnvironmentSettings),
  reducer, isTerminal, component: SentinelsEnvironmentGame,
};
