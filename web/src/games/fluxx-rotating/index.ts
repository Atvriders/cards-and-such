import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxRotatingState, FluxxRotatingAction, FluxxRotatingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FluxxRotatingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FluxxRotatingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxRotatingPlugin: GamePlugin<FluxxRotatingState, FluxxRotatingAction, typeof settings> = {
  id: "fluxx-rotating", title: "Fluxx Rotating Rules", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rotating-rule game quiz. Identify which rule shifts after each round in Fluxx.",
  howToPlay: "Fluxx Rotating Rules pays tribute to the rotating-rule game family — Fluxx and its many variants where the rules themselves change mid-game from cards drawn off the top of the deck. Each of twelve rounds presents a Fluxx-style rule (Draw 3, Play 2, Hand Limit 1, Keeper Limit 2, etc.) and asks how it changes the action. Pick from four interpretations, ten points each, max 120. The original Fluxx invented this 'shifting rules' mechanic in 1997, and it has since spawned dozens of themed variants. Players who've actually played Fluxx (any version) routinely hit 90+ as the rule lexicon gets internalized. New players should expect 50-70 — but the quiz teaches the language fast. Two minutes total. Submit each pick, Next to advance. After playing through, you'll be ready to jump into any flavour of Fluxx (Original, Star, Zombie, Cthulhu, Pirate, Monty Python, etc.) with confidence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxRotatingSettings),
  reducer, isTerminal, hint: (state: FluxxRotatingState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fluxx-rotating-answer-0"]', pulses: 3 } : null, component: FluxxRotatingGame,
};
