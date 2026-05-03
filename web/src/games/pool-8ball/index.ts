import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type Pool8BallState, type Pool8BallAction } from "./state.js";
import { Pool8Ball } from "./Game.js";

export const pool8BallSettings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["easy", "medium", "hard"] as const, default: "medium" as const },
} as const;

export const pool8BallPlugin: GamePlugin<Pool8BallState, Pool8BallAction, typeof pool8BallSettings> = {
  id: "pool-8ball",
  title: "Pool — 8 Ball",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sink your group (solids or stripes) then pocket the 8-ball to win.",
  howToPlay: `8-Ball Pool is the classic billiards game played on a table with 15 numbered balls and a white cue ball. You play against a bot opponent taking alternating turns.

On your turn, first pick a target ball from the rack. During the first few shots no groups are assigned — whichever ball you sink first assigns your group: solids (1–7) or stripes (9–15), and the bot gets the other. After groups are set you can only target your own balls.

Once you pick a ball, set your Aim angle (center = 0.5, ideal) and Power (0.6 is ideal). Click Shoot — deterministic physics based on your sliders and a seeded random factor decide whether the ball drops. A perfect center aim with 60% power gives the best odds; deviating reduces your chance. If you sink a ball you keep shooting; if you miss it's the bot's turn.

After pocketing all 7 of your group balls, you must legally sink the 8-ball to win. Sinking the 8-ball early is an instant loss. The bot follows the same rules automatically.

Difficulty controls how forgiving the physics are: Easy is generous, Hard requires precision. First player to legally pocket all their balls plus the 8-ball wins.`,
  settings: pool8BallSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".pool-btn", pulses: 3 }; },
  component: Pool8Ball,
};
