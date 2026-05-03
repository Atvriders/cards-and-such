import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UncleWiggilyState, UncleWiggilyAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const UncleWiggily = /* @__PURE__ */ lazy(() => import("./UncleWiggily.js").then((mod) => ({ default: mod.UncleWiggily as unknown as React.ComponentType<unknown> })));
export const uncleWiggilySettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type UncleWiggilySettingsType = SettingsOf<typeof uncleWiggilySettings>;

export const uncleWiggilyPlugin: GamePlugin<UncleWiggilyState, UncleWiggilyAction, typeof uncleWiggilySettings> = {
  id: "uncle-wiggily",
  title: "Uncle Wiggily",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "A themed racing game. Draw story cards and race to space 80, avoiding special event spaces!",
  howToPlay: `Uncle Wiggily is a classic children's racing game set in a whimsical storybook world. Race along an 80-space track from start to finish, drawing cards each turn to determine how far you move.

Each turn click "Draw Card" to reveal your card. Most cards move you forward a number of spaces. Some cards send you backward, make you skip your next turn, or give you a bonus on your next draw. Special "Story Jump" cards teleport you to a specific space on the track.

Watch out for themed special spaces along the track (shown in yellow). Landing on one triggers an event: Fox's Den sends you back 5, the Muddy Road makes you skip a turn, Nurse Jane's cottage boosts you forward 10, and the dreaded Lost in Forest sends you all the way back to start! The Shortcut Bridge near the end jumps you ahead to space 65.

Race against 1–3 bot opponents who take their turns automatically. First player to reach or pass space 80 wins!

Tips: Story Jump cards can be powerful — a jump to space 60 puts you very close to home. Bonus cards stack on your next move, so time them well. The special spaces at 38 and 15 are the most dangerous; try to land just past them.`,
  settings: uncleWiggilySettings,
  initialState: (seed: number, settings: UncleWiggilySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".uw-btn", pulses: 3 }; },
  component: UncleWiggily,
};
