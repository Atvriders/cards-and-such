import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { quietYearMapState, quietYearMapAction, quietYearMapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { quietYearMapGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quietYearMapPlugin: GamePlugin<quietYearMapState, quietYearMapAction, typeof settings> = {
  id: "quiet-year-map",
  title: "The Quiet Year",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Collaborative map-drawing community-building — observation rounds about the village.",
  howToPlay: "The Quiet Year is a collaborative map-drawing community-building story game distilled to fifteen observation-recognition rounds. Each round presents a community detail and asks you to identify the matching aspect from four options.\n\nThe pool of village-aspect clues includes Resource (River bend with fish), Threat (Wolves in the forest), Hope (Children play in the meadow), Tradition (Harvest festival in autumn), Decay (Old well runs dry), and other community-development scenarios. Each correct answer scores ten points; max 150.\n\nClick an aspect, press Submit to lock, then Next to advance. The original Quiet Year is a card-and-map collaborative storytelling game over four seasons of crisis. This distillation captures the community-detail recognition without the full storytelling and map-drawing layer. Reflective players score 130+; story-builders hit perfect 150.\n\nUse it as a thoughtful community-imagination warmup or a meditative game-night warm-down.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as quietYearMapSettings),
  reducer,
  isTerminal,
  component: quietYearMapGame,
};
