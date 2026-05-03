import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WizardState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Wizard } from "./Wizard.js";

export const wizardSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot Difficulty",
    options: ["easy", "standard"] as const,
    default: "standard" as const,
  },
} as const;

type WizardSettingsType = SettingsOf<typeof wizardSettings>;
type WizardAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const wizardPlugin: GamePlugin<WizardState, WizardAction, typeof wizardSettings> = {
  id: "wizard",
  title: "Wizard",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "60-card trick-taking with Wizards and Jesters. Bid exactly right or lose points.",
  howToPlay: `Wizard is a trick-taking game for 4 players using a 60-card deck: the standard 52 cards plus 4 Wizards and 4 Jesters.

Setup: Each player receives 10 cards. The next card is turned face up to declare trump. If a Wizard is turned up, the dealer picks trump (auto-set to spades). If a Jester is turned up, there is no trump this hand.

Bidding: Each player predicts exactly how many tricks they will win (0–10). Bids are not required to total 10, so it is entirely possible that bids are over or under the number of tricks available.

Playing: You must follow the led suit if possible; otherwise play any card. Special card rules: a Wizard always wins the trick — if multiple Wizards are played, the first one wins. A Jester always loses. If a Jester leads, the second card played sets the suit (another Jester = no suit, anyone may play anything).

Scoring: If you win exactly the number of tricks you bid, score 20 + 10 × your bid. If you win more or fewer tricks, lose 10 × the number by which you missed.

Strategy: Count Wizards and Jesters carefully. A Wizard in your hand guarantees a win; a Jester lets you throw off a trick you don't want.

Controls: During bidding, click the number of tricks you predict. During play, click a highlighted card to play it.`,
  settings: wizardSettings,
  initialState: (seed: number, settings: WizardSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WizardState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-wizard-primary"]', pulses: 3 };
  },
  component: Wizard,
};
