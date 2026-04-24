import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MexicoState, MexicoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MexicoDice } from "./MexicoDice.js";

const mexicoSettings = {
  lives: {
    kind: "enum" as const,
    label: "Lives",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

type MexicoSettingsType = SettingsOf<typeof mexicoSettings>;

export const mexicoDicePlugin: GamePlugin<MexicoState, MexicoAction, typeof mexicoSettings> = {
  id: "mexico-dice",
  title: "Mexico",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice up to three times and try to beat the bot. Mexico (2-1) beats everything.",
  howToPlay: `Mexico is a two-player bluffing and press-your-luck dice game. Each round, both players roll two dice and try to roll the highest combination. You roll first — up to three times — and decide when to keep your result.

Dice combinations rank from highest to lowest: Mexico (a 2 and a 1) beats all; then doubles rank by face value (6-6 is highest); then other combinations rank by the higher die, then the lower die (e.g. 6-5 beats 6-4).

Click Roll to roll your dice, then Roll Again to try to improve, or Keep to lock in your result. After you keep (or use all three rolls), the bot takes its turn automatically. The round result is then revealed — the loser loses one life.

The bot's strategy is to keep doubles or Mexico immediately, otherwise it rerolls hoping to improve. Manage your lives carefully. Start with 3 or 5 lives.

The player with lives remaining when the opponent reaches zero wins. Your score is the number of lives you have left.`,
  settings: mexicoSettings,
  initialState: (seed: number, settings: MexicoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MexicoDice,
};
