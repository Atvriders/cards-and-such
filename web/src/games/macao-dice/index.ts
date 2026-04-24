import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MacaoDiceState, MacaoDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MacaoDice } from "./MacaoDice.js";

const macaoDiceSettings = {
  startChips: {
    kind: "enum" as const,
    label: "Starting chips",
    options: ["10", "20", "50"] as const,
    default: "20" as const,
  },
} as const;

type MacaoDiceSettingsType = SettingsOf<typeof macaoDiceSettings>;

export const macaoDicePlugin: GamePlugin<MacaoDiceState, MacaoDiceAction, typeof macaoDiceSettings> = {
  id: "macao-dice",
  title: "Macao",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet chips and roll one die against the dealer. Roll a 6 for Macao — win triple!",
  howToPlay: `Macao (also called Macau) is a popular betting dice game. Each round, you place a bet and then both you and the dealer simultaneously reveal a single die roll.

If your die shows a higher number than the dealer's, you win your bet. If lower, you lose. On a tie, you must roll again — your cumulative totals are compared until someone is higher.

The special rule: if you roll a 6 and the dealer does not, that's "Macao" — you win three times your bet! The same applies if the dealer rolls a 6 and you don't — you lose triple. This creates exciting all-or-nothing moments.

Set your bet using the quick-select buttons or the slider before each round. Play continues for 10 rounds. Manage your chips wisely — a bad run can wipe you out, while a lucky Macao can double your stack in one roll.

Your final score is your chip count. Starting with 20 chips, a score above 20 means you profited. Aim for 40+ for a strong performance.`,
  settings: macaoDiceSettings,
  initialState: (seed: number, settings: MacaoDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MacaoDice,
};
