import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Game500State, Game500Action, Game500Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Game500Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game500Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const game500Plugin: GamePlugin<Game500State, Game500Action, typeof settings> = {
  id: "game-500", title: "500", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-suit-style trick-taking with bidding and a kitty exchange.",
  howToPlay: "500 is a classic North American trick-taking game similar to Euchre but with bidding and a kitty. Each round, players are dealt ten cards while three cards are placed face-down in the kitty. The high bidder declares a contract (number of tricks plus trump suit) and may swap cards with the kitty before play. Suits are ranked specially with right and left bowers as the top trumps. In this one-on-one duel against the CPU, both sides play across six bidding rounds, scoring positively for making contract and negatively for failing. Click Play Round to bid and play out the hand. Strategy: bid only when your hand contains both bowers or a five-card trump suit, and use the kitty to discard losing off-suit cards. Aim for at least four made contracts across the six-round match — a positive total score of four hundred or more is excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Game500Settings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-game-500-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-game-500-next"]', pulses: 3 };
    return null;
  }, component: Game500Game,
};
