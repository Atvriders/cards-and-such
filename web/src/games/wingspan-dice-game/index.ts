import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WingspanDiceGameState, WingspanDiceGameAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WingspanDiceGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const wingspanDiceGamePlugin: GamePlugin<WingspanDiceGameState, WingspanDiceGameAction, typeof settings> = {
  id: "wingspan-dice-game",
  title: "Wingspan Dice Game",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll-and-write bird scoring with habitat dice.",
  howToPlay: "Wingspan Dice Game is a quick solo dice game. Roll-and-write bird scoring with habitat dice. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice; assign to forest/grass/water habitats — each habitat pays its sum if filled.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: WingspanDiceGame,
};
