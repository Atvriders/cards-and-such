import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardHotColdState, CardHotColdAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardHotCold } from "./CardHotCold.js";

export const cardHotColdSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof cardHotColdSettings>;

export const cardHotColdPlugin: GamePlugin<CardHotColdState, CardHotColdAction, typeof cardHotColdSettings> = {
  id: "card-hot-cold",
  title: "Card Hot Cold",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess whether the hidden card is hot (7+) or cold (6 and below).",
  howToPlay: `Card Hot Cold is a simple prediction game based on card ranks. Each round you see a face-up card and a hidden card. Your job is to predict whether the hidden card is Hot (rank 7 or higher: 7, 8, 9, 10, Jack, Queen, King, Ace) or Cold (rank 6 or lower: 2, 3, 4, 5, 6).

Click Hot or Cold to make your prediction. The hidden card is revealed immediately. A correct prediction earns 10 points.

After seeing the result, click Next to continue to the next round. Play 5, 10, or 15 rounds depending on your settings.

The deck is well shuffled — there are exactly 28 hot cards and 24 cold cards in a standard deck (counting Aces as hot), giving hot a slight statistical edge.

Tips: With more hot cards than cold, guessing Hot when you are uncertain gives you better odds. However, if you have seen many high-value cards early in the game, the remaining deck skews colder. Use your memory to refine guesses over time.`,
  settings: cardHotColdSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CardHotColdState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-card-hot-cold-primary"]', pulses: 3 } : null),
  component: CardHotCold,
};
