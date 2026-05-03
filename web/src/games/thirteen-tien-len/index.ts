import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThirteenTienLenState, ThirteenTienLenAction, ThirteenTienLenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ThirteenTienLenGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ThirteenTienLenGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const thirteenTienLenPlugin: GamePlugin<ThirteenTienLenState, ThirteenTienLenAction, typeof settings> = {
  id: "thirteen-tien-len", title: "Thirteen (Tien Len)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Vietnamese shedding game — climb past with higher singles or sets.",
  howToPlay: "Thirteen, also called Tien Len in Vietnamese, is a shedding card game where each player receives thirteen cards and races to empty their hand by playing singles, pairs, triples, sequences, or four-of-a-kinds higher than the previous play. The 2 is the highest single rank (a '2 of spades' is the absolute top), but four-of-a-kind and three consecutive pairs can bomb a 2. The player holding the 3 of spades leads the first hand. In this one-on-one CPU duel across six rounds, click Play Round to deal and resolve play. Strategy: save your 2s and bombs for the late-round endgame when both hands are smaller. Lead long sequences to force the CPU to break up their pairs. Going out first scores fifty points plus ten per CPU card remaining. Aim for at least three round wins and a total above one hundred fifty for a strong Tien Len performance.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThirteenTienLenSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-thirteen-tien-len-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-thirteen-tien-len-next"]', pulses: 3 };
    return null;
  }, component: ThirteenTienLenGame,
};
