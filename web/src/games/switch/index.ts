import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwitchState, SwitchAction, SwitchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SwitchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SwitchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const switchPlugin: GamePlugin<SwitchState, SwitchAction, typeof settings> = {
  id: "switch", title: "Switch", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British Crazy Eights variant — match suit or rank, special action cards.",
  howToPlay: "Switch is the British cousin of Crazy Eights and Uno — a fast shedding card game where you race to empty your hand by playing cards that match either the suit or rank of the top of the discard pile. Several action cards spice things up: 2s force the next player to pick up two (and stack), 8s skip the next player, jacks reverse direction, and aces let you change the suit. In this one-on-one CPU duel across six rounds, click Play Round to deal seven-card hands and simulate play. Strategy: hold back aces for emergencies when you cannot match, and play 2s into 2s to chain the pickup penalty back at the CPU. Saving a jack-pair lets you reverse-and-skip to win in tight finishes. Going out earns twenty points plus five per CPU card remaining. Aim for at least three round wins and a total above eighty for a strong Switch performance.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SwitchSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-switch-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-switch-next"]', pulses: 3 };
    return null;
  }, component: SwitchGame,
};
