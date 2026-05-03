import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type ShuffleboardState, type ShuffleboardAction } from "./state.js";
import { Shuffleboard } from "./Game.js";

export const shuffleboardSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["3", "5", "7"] as const, default: "5" as const },
} as const;

export const shuffleboardPlugin: GamePlugin<ShuffleboardState, ShuffleboardAction, typeof shuffleboardSettings> = {
  id: "shuffleboard",
  title: "Shuffleboard",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide 4 discs down a 15-ft lane. Closest to the far edge scores highest. Beat the bot!",
  howToPlay: `Shuffleboard is a classic alley game played on a long smooth lane. You face the bot, each sliding 4 discs per round. The lane is 100 units long with scoring zones near the far end: 1 point (positions 60–74), 2 points (75–87), and 3 points (88–100). Going past 100 means your disc falls off and scores nothing.

Each turn you slide one disc, followed immediately by the bot's disc. Set your Angle (center 50% is ideal — deviating sends the disc sideways off the lane) and Power (75% is the sweet spot — too much overshoots, too little falls short). Click Slide to launch.

After 4 pairs of discs, the round scoring is tallied using cancellation rules: only the player whose disc is closest to the far end scores, and only their discs ahead of the opponent's best disc count. So knocking your opponent's discs out of scoring position is smart strategy.

Play 3, 5, or 7 rounds. Highest total score wins. Score = points × 100 + 500 bonus if you win overall. Keep your discs in the 3-point zone and knock the bot's back!`,
  settings: shuffleboardSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".sb-btn", pulses: 3 }; },
  component: Shuffleboard,
};
