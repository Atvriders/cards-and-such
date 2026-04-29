import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { QwixxMixxerState, QwixxMixxerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QwixxMixxer } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const qwixxMixxerPlugin: GamePlugin<QwixxMixxerState, QwixxMixxerAction, typeof settings> = {
  id: "qwixx-mixxer",
  title: "Qwixx MixXxer",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Qwixx-flavoured roll-and-mark — score by climbing rows.",
  howToPlay: "Qwixx MixXxer is a quick solo dice game. Qwixx-flavoured roll-and-mark — score by climbing rows. Each round you roll five six-sided dice and score points based on the round's special twist: Each round roll 5 dice; mark sum into 4 colour rows. Highest unique counts.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: QwixxMixxer,
};
