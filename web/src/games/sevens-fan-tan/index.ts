import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevensFanTanState, SevensFanTanAction, SevensFanTanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SevensFanTanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SevensFanTanGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sevensFanTanPlugin: GamePlugin<SevensFanTanState, SevensFanTanAction, typeof settings> = {
  id: "sevens-fan-tan", title: "Sevens (Fan Tan)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build suit sequences from 7 outward — also called Parliament/Domino.",
  howToPlay: "Sevens, also known as Fan Tan, Parliament, or Domino, is a classic shedding card game where players build suit-sequences outward from each suit's seven. The first player to play must start with a seven (typically the seven of diamonds); subsequent players add either a six or eight of any started suit, building down to ace and up to king. If you cannot play, you must pass — failing to play when you could costs a penalty. The first player to empty their hand wins the round. In this one-on-one CPU duel across six rounds, click Play Round to simulate the deal and sequence-building. Strategy: play sevens as soon as possible to open your other long suits, and hold back kings and aces to deliver the killing blow at the end of a sequence. Going out earns twenty-five points plus a five-per-card bonus on the CPU's remaining hand. Aim for at least three round wins for a strong Sevens performance.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevensFanTanSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-sevens-fan-tan-next"]', pulses: 3 };
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-sevens-fan-tan-play"]', pulses: 3 };
    return null;
  }, component: SevensFanTanGame,
};
