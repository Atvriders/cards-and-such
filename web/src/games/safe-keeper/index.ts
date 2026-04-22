import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SafeKeeperState, SafeKeeperAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SafeKeeper } from "./SafeKeeper.js";

export const safeKeeperSettings = {
  marksToLose: {
    kind: "enum" as const,
    label: "Marks to Lose",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type SafeKeeperSettingsType = SettingsOf<typeof safeKeeperSettings>;

export const safeKeeperPlugin: GamePlugin<SafeKeeperState, SafeKeeperAction, typeof safeKeeperSettings> = {
  id: "safe-keeper",
  title: "Safe Keeper",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-Man variant. One player is the Safe Keeper — avoid marks from sevens, threes, and doubles. First to N marks loses!",
  howToPlay: `Safe Keeper is a social dice game based on the classic drinking game "Three-Man," adapted for three players (you vs two bots). At the start, one player is the "Safe Keeper" — a role you want to pass on quickly.

On each turn, two dice are rolled. Special results apply:
- Sum equals 7: the Safe Keeper receives 1 mark (penalty).
- Sum equals 11: the active roller receives 1 mark.
- Any die showing a 3: the Safe Keeper receives 1 mark.
- Doubles (any): each neighbor receives 1 mark.
- Double 3s: the Safe Keeper receives 2 marks.
- If the active player rolls a 3 and is NOT the Safe Keeper, they BECOME the new Safe Keeper.

The player who accumulates N marks first (5, 7, or 10 — set in options) loses the game.

Strategy: as Safe Keeper, you want to pass the role. As a regular player, watch out for 11s (instant self-penalty) and doubles which hurt your neighbors. Becoming Safe Keeper temporarily can be bad luck if the dice keep rolling 7s and 3s.

Play cycles through you → Bot 1 → Bot 2 → repeat. Click "Roll Dice" on your turn; bots roll automatically when it's their turn.`,
  settings: safeKeeperSettings,
  initialState: (seed: number, settings: SafeKeeperSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SafeKeeper,
};
