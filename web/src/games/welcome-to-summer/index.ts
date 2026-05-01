import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeToSummerState, WelcomeToSummerAction, WelcomeToSummerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeToSummerGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const welcomeToSummerPlugin: GamePlugin<WelcomeToSummerState, WelcomeToSummerAction, typeof settings> = {
  id: "welcome-to-summer",
  title: "Welcome To Summer",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sunny variant — pool bonuses and sunshine multipliers.",
  howToPlay: `Welcome To Summer is a strict-ascending placement dice game.

How to play
1. Press Roll for a d12.
2. Place the number into any slot in any of the 3 rows of 5 — but each row must remain strictly ascending.
3. Place gives die value + adjacency bonus (+2 if a neighbor is exactly one less or more).
4. Skip if no legal slot — costs −1 to score.

Theme: Even rolls: +pool bonus.

End-of-game bonuses
- Each completed row: +6
- Full board: +10

Game ends after 12 rolls or when all 15 slots are filled. Strong runs reach 60-100.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as WelcomeToSummerSettings),
  reducer,
  isTerminal,
  component: WelcomeToSummerGame,
};
