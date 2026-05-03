import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSequence3State, DiceSequence3Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceSequence3 = /* @__PURE__ */ lazy(() => import("./DiceSequence3.js").then((mod) => ({ default: mod.DiceSequence3 as unknown as React.ComponentType<unknown> })));
export const diceSequence3Settings = { rounds: { kind: "enum" as const, label: "Rounds", options: ["5","10","15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof diceSequence3Settings>;
export const diceSequence3Plugin: GamePlugin<DiceSequence3State, DiceSequence3Action, typeof diceSequence3Settings> = {
  id: "dice-sequence-3", title: "Dice Sequence 3", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll three dice and score big when they form a consecutive sequence.",
  howToPlay: `Dice Sequence 3 is a luck-based dice game. Each round three dice are rolled and you score points based on whether they form a consecutive sequence. If the three dice show three consecutive numbers in any order (such as 2-3-4, 4-5-6, or 1-2-3), you score 30 points for a Sequence. If all three dice are different but not consecutive, you score 5 points. If any dice match, you score nothing. Click Roll to see your result and proceed to the next round. Play 5, 10, or 15 rounds. Tips: Sequences occur in roughly 1 in 9 rolls on average. The prize of 30 points makes chasing sequences highly worthwhile. A perfect game of all sequences (5 rounds) totals 150 points.`,
  settings: diceSequence3Settings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal, 
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-sequence-3-roll"]', pulses: 3 }; },
  component: DiceSequence3,
};
