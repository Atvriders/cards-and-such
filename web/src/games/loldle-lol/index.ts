import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { loldleLolState, loldleLolAction, loldleLolSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { loldleLolGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const loldleLolPlugin: GamePlugin<loldleLolState, loldleLolAction, typeof settings> = {
  id: "loldle-lol",
  title: "Loldle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "League of Legends champion guessing — multi-attribute feedback columns.",
  howToPlay: "Loldle is a League of Legends champion guessing game distilled to fifteen-round multiple-choice format. Each round presents a champion description and asks you to identify the matching champion from four options.\n\nThe pool of champion descriptions includes Top Lane Tank (Heavy armor, single-target stuns), Jungle Assassin (Burst damage, mobile), Mid Lane Mage (Long-range spells, AoE), ADC Marksman (Auto-attack focused, late game), Support Enchanter (Shields and heals), and other archetype hints from the LoL roster. Each correct answer scores ten points; max 150.\n\nClick a champion, press Submit to lock, then Next to advance. The original Loldle uses multi-attribute feedback columns (role, region, gender) over a hidden champion guess; this distillation captures the archetype-recognition aspect without the column-feedback loop. League veterans score 130+; champion experts hit perfect 150.\n\nUse it as a quick LoL-knowledge drill or a casual warmup between matches.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as loldleLolSettings),
  reducer,
  isTerminal,
  component: loldleLolGame,
};
