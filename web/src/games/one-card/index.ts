import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OneCardState, OneCardAction, OneCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OneCardGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const oneCardPlugin: GamePlugin<OneCardState, OneCardAction, typeof settings> = {
  id: "one-card", title: "One Card", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Korean Crazy Eights-like — match suit or number, declare 'one card'.",
  howToPlay: "One Card is the Korean cousin of Uno and Crazy Eights, a popular shedding card game where players take turns matching either the suit or rank of the top discard. Special cards (2s, 7s, jacks, queens) trigger draws, skips, and reverses. The signature rule is that when a player has only one card left in hand they must declare 'one card!' aloud — failing to call results in a draw penalty. In this one-on-one CPU duel across six rounds, click Play Round to simulate the deal, action cards, and shedding race. Strategy: chain twos to force big draws on the CPU, and time your 'one card' declaration carefully — declare too early and the CPU may dump action cards on you. Going out scores twenty points plus a five-point bonus per CPU card remaining. Aim for three round wins and a total above seventy-five.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OneCardSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-one-card-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-one-card-next"]', pulses: 3 };
    return null;
  }, component: OneCardGame,
};
