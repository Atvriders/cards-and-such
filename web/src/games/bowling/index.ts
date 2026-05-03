import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type BowlingState, type BowlingAction } from "./state.js";
import { Bowling } from "./Bowling.js";

export const bowlingSettings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["easy", "medium", "hard"] as const, default: "medium" as const },
} as const;

export const bowlingPlugin: GamePlugin<BowlingState, BowlingAction, typeof bowlingSettings> = {
  id: "bowling",
  title: "Bowling",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ten frames of pin-knocking. Aim well, roll often, score with strikes and spares.",
  howToPlay: `Bowling gives you 10 frames of classic pin-knocking action. Each frame you get up to two rolls to knock down all 10 pins.

Use the aim slider to set your angle before rolling. The center position (50%) is ideal — the further you move from center, the more your ball will stray. Difficulty controls how forgiving the aim tolerance is: easy gives you a wide margin, hard requires much more precision.

Scoring follows standard bowling rules. A strike (all 10 pins on the first roll) scores 10 plus the total of your next two rolls. A spare (all 10 pins across two rolls) scores 10 plus the pins knocked on the next roll. Regular frames score the total pins knocked.

The 10th frame is special: score a strike or spare and you earn a bonus roll (up to three rolls in the final frame).

A perfect game — 12 strikes in a row — scores 300. Aim for the center and let the pins fall!

Tips: consistency is key. Sticking close to center every roll beats random wild swings. On your second roll, remember the aim that left pins — compensate slightly toward the cluster.`,
  settings: bowlingSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-bowling-action"]', pulses: 3 }; },
  component: Bowling,
};
