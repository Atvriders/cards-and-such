import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PirateDiceState, PirateDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PirateDice } from "./PirateDice.js";

export const pirateDiceSettings = {
  target: {
    kind: "enum" as const,
    label: "Treasure Target",
    options: ["5", "10", "15"] as const,
    default: "10",
  },
} as const;

type PirateDiceSettingsType = SettingsOf<typeof pirateDiceSettings>;

export const pirateDicePlugin: GamePlugin<PirateDiceState, PirateDiceAction, typeof pirateDiceSettings> = {
  id: "pirate-dice",
  title: "Pirate Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 themed dice — collect gold and diamonds before three skulls sink your ship!",
  howToPlay: `Pirate Dice is a push-your-luck treasure hunt with themed dice faces: Gold (6), Diamond (5), Saber (2), Treasure Map (3 or 4), and Skull (1).

Each turn, roll all 5 dice. Skulls lock automatically — three skulls in total and you're sunk, losing all treasure gathered this turn. Gold coins score 3 points each; diamonds score 1 point each. Collect three or more sabers to double all your scoring dice.

After rolling, you may keep any non-skull scoring dice by clicking them. Treasure Map dice can be re-rolled freely. Click "Re-roll Maps" to roll only the unkepped dice, pushing your luck further. When satisfied with your score, click "Bank Treasure" to add your turn score to your running total.

If you accumulate 3 skulls at any point during the turn, you are sunk — all turn treasure is lost. Click "Next Turn" and try again.

Reach the treasure target to win! Your final score rewards doing it in fewer turns. A bold captain banks big hauls; a wise one knows when to stop.`,
  settings: pirateDiceSettings,
  initialState: (seed: number, settings: PirateDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: PirateDice,
};
