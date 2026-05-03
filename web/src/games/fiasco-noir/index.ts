import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { fiascoNoirState, fiascoNoirAction, fiascoNoirSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const fiascoNoirGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.fiascoNoirGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fiascoNoirPlugin: GamePlugin<fiascoNoirState, fiascoNoirAction, typeof settings> = {
  id: "fiasco-noir",
  title: "Fiasco",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Collaborative crime noir storytelling — fifteen relationship-pair recognitions.",
  howToPlay: "Fiasco is a collaborative crime noir storytelling game distilled to fifteen relationship-pair recognition rounds. Each round presents a noir scenario and asks you to identify the matching relationship pair from four options.\n\nThe pool of noir relationship-pair clues includes Ex-Lovers (Hatred mixed with longing), Old Partners (Crimes in the past), Rival Family Members (Inheritance war), Secret Affair (Spouse doesn't know), Boss & Underling (Money owed), and other classic Fiasco relationships. Each correct answer scores ten points; max 150.\n\nClick a relationship, press Submit to lock, then Next to advance. The original Fiasco uses dice-tables for object/place/relationship setup and a free-form storytelling structure; this distillation preserves the relationship-recognition aspect without the dice-driven setup. Story-game fans score 130+; noir enthusiasts hit perfect 150.\n\nUse it as a quick noir-archetype warmup or a calm RPG-themed brainteaser. Read the scenario, picture the dynamic, and pick.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as fiascoNoirSettings),
  reducer,
  isTerminal,
  
  hint: (state: fiascoNoirState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fiasco-noir-answer-0"]', pulses: 3 } : null,component: fiascoNoirGame,
};
