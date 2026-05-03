import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlagsMemoryState, FlagsMemoryAction, FlagsMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FlagsMemoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FlagsMemoryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const flagsMemoryPlugin: GamePlugin<FlagsMemoryState, FlagsMemoryAction, typeof settings> = {
  id: "flags-memory", title: "National Flags Memory", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match country names to their flag descriptions.",
  howToPlay: "National Flags Memory tests world geography by describing flags and asking you to name the country. Each of fifteen rounds presents a textual description (Red disc on white, Six color Y design, Stars and stripes) and four candidate countries. Tap the correct one, hit Submit, score ten points if right. The pool spans Japan, Canada, Brazil, Switzerland, UK, USA, France, Germany, China, South Africa, India, and Australia — twelve flags chosen to span continents and design styles (solid, tricolor, multi-symbol, cross). After all fifteen rounds the maximum is 150 points. A geography buff scores 130+; most players land 80-120. Useful as a kids geography drill or casual party trivia round. Each round is independent — you can guess wildly with no penalty beyond zero points. Hit Submit to lock, Next to continue. Finish all rounds to see your final tally and accuracy ratio. The textual flag descriptions encourage visualization rather than rote-memorization of imagery.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FlagsMemorySettings),
  reducer, isTerminal, hint: (state: FlagsMemoryState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-flags-memory-answer-0"]', pulses: 3 } : null, component: FlagsMemoryGame,
};
