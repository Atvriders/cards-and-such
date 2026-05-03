import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ISpyCardState, ISpyCardAction, ISpyCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ISpyCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ISpyCardGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const iSpyCardPlugin: GamePlugin<ISpyCardState, ISpyCardAction, typeof settings> = {
  id: "i-spy-card", title: "I Spy Card", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "I spy with my little eye - find the named object.",
  howToPlay: "I Spy Card adapts the classic 'I spy with my little eye' finding game to four-panel rounds. Each round names a target object ('I spy: key') and shows four candidate panels. Tap the matching object, hit Submit, score ten points. Fifteen rounds total, max 150 points. The pool spans 25 everyday objects — keys, balloons, gifts, dice, cameras, books, tools, magnifiers — enough variety that each round looks fresh. Decoy panels are randomly drawn from the same pool minus the target. I Spy Card trains visual scanning and word-image association in equal measure — your eye must tie the named object to its visual form, then locate it in the grid. Children playing for the first time score 90-120; experienced players regularly hit perfect 150. Hit Submit to lock your call, Next to advance through all fifteen rounds. Useful as a classroom warm-up, family-game-night opener, or quiet-reading-time alternative.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ISpyCardSettings),
  reducer, isTerminal, hint: (state: ISpyCardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-i-spy-card-answer-0"]', pulses: 3 } : null, component: ISpyCardGame,
};
