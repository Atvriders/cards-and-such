import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpadesState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Spades } from "./Spades.js";

export const spadesSettings = {
  botBidding: {
    kind: "enum" as const,
    label: "Bot Bidding",
    options: ["conservative", "balanced", "aggressive"] as const,
    default: "balanced" as const,
  },
} as const;

type SpadesSettingsType = SettingsOf<typeof spadesSettings>;

type SpadesAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const spadesPlugin: GamePlugin<SpadesState, SpadesAction, typeof spadesSettings> = {
  id: "spades",
  title: "Spades",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spades-are-trump trick-taking with partners. Bid your tricks, then deliver.",
  howToPlay: `Spades is a 4-player partnership trick-taking game where spades are always trump.

Teams: You and Bot 2 form one team; Bot 1 and Bot 3 form the other. Each player bids individually how many tricks they expect to take, but scoring is based on the team's combined bid.

Bidding: Choose a number from 0 to 13. A bid of 0 is called "Nil" — if you take zero tricks you gain 100 points, but if you take any tricks your team loses 100. Other bids contribute to your team's total bid.

Playing: The player to the left of the dealer leads the first trick. You must follow the led suit if possible; otherwise you may play any card including spades. The highest spade wins if any spade was played; otherwise the highest card of the led suit wins. Winner of each trick leads the next.

Scoring: If your team meets or exceeds its bid, you earn 10 points per trick bid plus 1 point per overtrick (bag). If you fall short, you lose 10 points per trick bid. Every 10 bags accumulated costs your team 100 points.

Controls: During bidding, click a number to set your bid. During play, click a legal card in your hand to play it. Legal cards are highlighted; illegal ones are dimmed.`,
  settings: spadesSettings,
  initialState: (seed: number, settings: SpadesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SpadesState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-spades-primary"]', pulses: 3 };
  },
  component: Spades,
};
