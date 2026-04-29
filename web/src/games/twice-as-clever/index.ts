import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TwiceAsCleverState, TwiceAsCleverAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwiceAsClever } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const twiceAsCleverPlugin: GamePlugin<TwiceAsCleverState, TwiceAsCleverAction, typeof settings> = {
  id: "twice-as-clever",
  title: "Doppelt So Clever",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "More chain bonuses; pass mechanism rewards low rolls.",
  howToPlay: "Doppelt So Clever is a quick solo dice game. More chain bonuses; pass mechanism rewards low rolls. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice; lowest die counts as bonus; total of remaining four scored.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: TwiceAsClever,
};
