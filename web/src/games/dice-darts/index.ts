import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DiceDartsState, DiceDartsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDarts } from "./DiceDarts.js";

export const diceDartsPlugin = {
  id: "dice-darts",
  title: "Dice Darts",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll three dice each turn to count down from 301 to exactly zero — bust if you overshoot!",
  howToPlay: `Dice Darts brings the classic 301 dart format to the dice table. You start with a score of 301 and roll three six-sided dice each turn. The total you roll is subtracted from your remaining score — your goal is to reach exactly zero.

The catch is the bust rule: if your roll would take you below zero, nothing changes and you waste a turn. For example, if you have 8 left and roll a 10, you bust and stay at 8.

The fewer turns you take to check out, the higher your final score. A perfect game (barely possible) would take around 17 turns; most games finish in 20–30 turns. Your score is calculated as 1000 minus 50 per turn used, so finishing in 20 turns gives you 0 — you want to be quick!

Strategy is limited since rolls are random, but you can watch the remaining count and know when a bust becomes likely. When your score is below 18 (minimum three-dice roll is 3), you need an exact match — a tense and satisfying finish!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: DiceDarts,
} as unknown as GamePlugin;
