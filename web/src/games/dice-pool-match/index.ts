import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DicePoolMatchState, DicePoolMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePoolMatch } from "./DicePoolMatch.js";

export const dicePoolMatchPlugin = {
  id: "dice-pool-match",
  title: "Dice Pool Match",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll a pool of five dice and keep the right ones to match the target pattern each round!",
  howToPlay: `Dice Pool Match is a five-round dice strategy game. Each round you are given a target pattern to hit — starting with Three of a Kind and escalating to Five of a Kind. You roll five dice, click any you want to keep, then roll again up to two more times.

After your third roll (or when you choose to stop rolling) the game checks whether your five dice match the round's target pattern. Hit it and earn the pattern's bonus points; miss it and score zero for that round.

Patterns and their points: Three of a Kind (100), Full House — a three and a pair (150), Four of a Kind (200), Small Straight — 1-2-3-4-5 (250), Five of a Kind (500).

Strategy: when you have a partial pattern after the first roll, keep the relevant dice and re-roll the rest. If you are close to a straight keep the run and hope for the missing face. Five of a Kind is rare — you may need all three rolls. Maximum possible score is 1200. Good luck!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: DicePoolMatch,
} as unknown as GamePlugin;
