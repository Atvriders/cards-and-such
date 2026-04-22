import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingdomsDiceState, KingdomsDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingdomsDice } from "./KingdomsDice.js";

export const kingdomsDiceSettings = {
  targetScore: {
    kind: "enum" as const,
    label: "Target Score",
    options: ["30", "50", "100"] as const,
    default: "50" as const,
  },
} as const;

type KingdomsDiceSettingsType = SettingsOf<typeof kingdomsDiceSettings>;

export const kingdomsDicePlugin: GamePlugin<KingdomsDiceState, KingdomsDiceAction, typeof kingdomsDiceSettings> = {
  id: "kingdoms-dice",
  title: "Kingdoms Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 3 dice and spend matching faces to buy kingdoms — race to the target score!",
  howToPlay: `Kingdoms Dice is a push-your-luck buying game. Four kingdom cards are laid out in the market, each showing a rank (1–6) and a point value. On your turn, roll 3 dice and try to match a die face to a kingdom's rank — if you match, you buy that kingdom and score its value. The bought card is replaced by a new one from the deck.

To buy a kingdom: click one of your dice to select it, then click a kingdom whose rank matches that die. You can only buy one kingdom per turn. If none of your dice match any kingdom, click Pass to end your turn.

The bot takes its turn automatically after yours, always buying the highest-value kingdom it can. First player to reach the target score (30, 50, or 100 points) wins.

Strategy: ranks near the average roll (3–4) appear more frequently on your dice. High-value kingdoms with common ranks are the best buys. Watch what the bot is targeting — if it keeps buying low-rank kingdoms, consider blocking with a die even for a small payoff to deny its progress.`,
  settings: kingdomsDiceSettings,
  initialState: (seed: number, settings: KingdomsDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: KingdomsDice,
};
