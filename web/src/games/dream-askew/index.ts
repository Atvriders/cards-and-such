import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { dreamAskewState, dreamAskewAction, dreamAskewSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const dreamAskewGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.dreamAskewGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const dreamAskewPlugin: GamePlugin<dreamAskewState, dreamAskewAction, typeof settings> = {
  id: "dream-askew",
  title: "Dream Askew",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Powered-by-the-Apocalypse RPG — fifteen role-recognition observations.",
  howToPlay: "Dream Askew is a Powered by the Apocalypse tabletop RPG with shared resource pool, distilled to fifteen role-recognition observations. Each round presents a character description and asks you to identify the matching role from four options.\n\nThe pool of character-role pairs includes Old Soul (Veteran, weary, wise), Hot Tycoon (Wealthy, bold, charismatic), Iris (Healer, kind, intuitive), Stitcher (Crafter, careful, observant), Tinker (Mechanic, precise, busy), and other PbtA-style character archetypes. Each correct answer scores ten points; max 150.\n\nClick a role, press Submit to lock, then Next to advance. The original Dream Askew is a no-GM RPG with token-based scene framing; this distillation preserves the role-recognition aspect without the storytelling resource pool. Roleplayers score 130+; archetype experts hit perfect 150.\n\nUse it as a quick character-archetype warmup or a calm RPG-themed brainteaser between sessions.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as dreamAskewSettings),
  reducer,
  isTerminal,
  
  hint: (state: dreamAskewState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-dream-askew-answer-0"]', pulses: 3 } : null,component: dreamAskewGame,
};
