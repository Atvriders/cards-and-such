import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SlotsState, SlotsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Slots } from "./Slots.js";

export const slotsSettings = {
  betSize: {
    kind: "enum" as const,
    label: "Bet per Spin (credits)",
    options: ["1", "5", "10"] as const,
    default: "5",
  },
  maxSpins: {
    kind: "enum" as const,
    label: "Max Spins",
    options: ["20", "50", "100"] as const,
    default: "50",
  },
} as const;

type SlotsSettingsType = SettingsOf<typeof slotsSettings>;

export const slotsPlugin: GamePlugin<SlotsState, SlotsAction, typeof slotsSettings> = {
  id: "slots",
  title: "Slots",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spin three reels. Match the fruits for payouts. Seven-seven-seven pays best.",
  howToPlay: `Classic 3-reel fruit-machine style slots! Start with 100 credits and bet on each spin.

Symbols from lowest to highest: Cherry, Lemon, Orange, Plum, Bell, Bar, Seven (7). Each reel independently lands on one of 20 positions, weighted toward common symbols.

Paytable (multiplied by your bet per spin):
• Any two Cherries: 1× — even two out of three pays!
• Three Lemons, Oranges, or Plums: 2×
• Three Cherries: 5×
• Three Bells: 10×
• Three BARs: 25×
• Three Sevens (777): 100× — JACKPOT!

Rarer symbols appear less often on the reels, so higher payouts are harder to hit. The Sevens appear twice out of 20 positions, making 777 quite rare.

Strategy: There's no skill in slots — just pick your bet size and enjoy the ride. Higher bets mean bigger wins and bigger losses, but the same house edge applies regardless of bet size.

Settings: Bet size (1, 5, or 10 credits per spin), max spins (20, 50, or 100). Score equals your final credit count.`,
  settings: slotsSettings,
  initialState: (seed: number, settings: SlotsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-slots-action"]', pulses: 3 }; },
  component: Slots,
};
