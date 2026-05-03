import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AuthorsState, AuthorsAction, AuthorsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AuthorsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AuthorsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const authorsPlugin: GamePlugin<AuthorsState, AuthorsAction, typeof settings> = {
  id: "authors", title: "Authors", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Go Fish for complete sets — collect all four of a rank.",
  howToPlay: "Authors is the educational ancestor of Go Fish, originally played with cards depicting famous authors and their works. Players take turns asking opponents for a specific rank ('do you have any kings?'). If the opponent has it they must surrender the card; if not they say 'go fish' and the asker draws from the stockpile. The goal is to collect all four cards of each rank — a complete book. Whoever has the most books at the end wins. In this one-on-one CPU duel across six rounds, click Play Round to deal seven-card hands and simulate the asking and fishing. Strategy: only ask for a rank when you already hold at least one card of it (the rule prevents fishing blind in classic Authors). Track which ranks the CPU has asked for to deduce their hand. Aim for at least three round wins and a total of fifteen-plus books across the match for a strong Authors finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AuthorsSettings),
  reducer, isTerminal, hint: (state: AuthorsState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-authors-primary"]', pulses: 3 } : null), component: AuthorsGame,
};
