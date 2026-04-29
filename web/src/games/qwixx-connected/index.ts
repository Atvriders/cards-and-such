import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { QwixxConnectedState, QwixxConnectedAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QwixxConnected } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const qwixxConnectedPlugin: GamePlugin<QwixxConnectedState, QwixxConnectedAction, typeof settings> = {
  id: "qwixx-connected",
  title: "Qwixx Connected",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connected Qwixx variant where rows share marks.",
  howToPlay: "Qwixx Connected is a quick solo dice game. Connected Qwixx variant where rows share marks. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice, mark a row of choice; bonus for chains across rows.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: QwixxConnected,
};
