import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type PennyFlipState, type PennyFlipAction } from "./state.js";
import { PennyFlip } from "./PennyFlip.js";

export const pennyFlipSettings = {} as const;

export const pennyFlipPlugin: GamePlugin<PennyFlipState, PennyFlipAction, typeof pennyFlipSettings> = {
  id: "penny-flip",
  title: "Penny Flip",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict heads or tails for 20 flips. Score as many correct guesses as possible!",
  howToPlay: `Penny Flip is a fixed-length coin prediction game. Unlike streak-based coin games, you play through all 20 flips no matter what — wrong answers do not end the game!

Before each flip, choose Heads or Tails, then click Flip to reveal the result. Every correct prediction scores 5 points. After all 20 flips, the game ends and your final score is tallied.

A perfect score of 100 (20/20 correct) is theoretically possible but astronomically unlikely — expect to land around 10 correct on average (50% hit rate on a fair coin). Anything above 13 correct is above the statistical norm and worth celebrating!

The coin is perfectly fair: each flip is independent and has a 50/50 probability. No pattern from previous flips predicts the next one. Some players like to watch sequences and "feel" patterns — this is gambler's fallacy, but it makes the game feel more exciting.

Scoring breakdown: 5 points per correct flip, max score 100. The history row at the bottom fills in as you go — green dots for correct, red for wrong.

Tips: try alternating Heads/Tails each flip, or always pick the same side, or follow a personal pattern. None of it changes your expected score, but it adds a layer of personal strategy to what is ultimately a luck game.`,
  settings: pennyFlipSettings,
  initialState,
  reducer,
  isTerminal,
  component: PennyFlip,
};
