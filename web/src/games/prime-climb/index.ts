import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PCState, PCAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PrimeClimb } from "./PrimeClimb.js";

export const primeClimbSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "fast"] as const,
    default: "fast",
  },
} as const;

type PrimeClimbSettingsType = SettingsOf<typeof primeClimbSettings>;

export const primeClimbPlugin: GamePlugin<PCState, PCAction, typeof primeClimbSettings> = {
  id: "prime-climb",
  title: "Prime Climb",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race two pawns to 101 using arithmetic and dice.",
  howToPlay: `Prime Climb is a math race game for two players (you vs the bot). Each player has two pawns, both starting at 0. The goal is to land both pawns exactly on 101.

Each turn you roll two ten-sided dice (faces 1–10). You must apply each die to one of your pawns using any arithmetic operation: add (+), subtract (−), multiply (×), or divide (÷). Division is only legal when the result is a whole number. You cannot exceed 101 or go below 0.

Click a pawn to select it, click a die, then click an operation. Repeat for the second die.

101 is a prime number, so landing on it is always safe. If you were to land on a composite number above 1, that pawn would be sent back to 0 — but since our target is 101 which is prime, this trap does not apply here.

The bot plays a greedy strategy: it tries every combination of pawn, die, and operation and picks the move that maximises the position of its weakest pawn.

Scoring: first player to land both pawns on 101 wins. Win = 200 points, loss = 0.

Tips: Multiplication is powerful early game. Division can create unexpected shortcuts if you land on a composite with a useful factor.`,
  settings: primeClimbSettings,
  initialState: (seed: number, settings: PrimeClimbSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".pc-roll-btn", pulses: 3 }; },
  component: PrimeClimb,
};
