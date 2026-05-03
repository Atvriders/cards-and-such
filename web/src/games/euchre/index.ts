import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EuchreState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Euchre } from "./Euchre.js";

export const euchreSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type EuchreSettingsType = SettingsOf<typeof euchreSettings>;

import type { Suit } from "../../engines/deck/index.js";
type EuchreAction =
  | { type: "order-up" }
  | { type: "pass" }
  | { type: "name-suit"; suit: Suit }
  | { type: "play"; cardId: string };

export const euchrePlugin: GamePlugin<EuchreState, EuchreAction, typeof euchreSettings> = {
  id: "euchre",
  title: "Euchre",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "24-card trump game with partners. Nickname 'bowers' are the two highest trumps.",
  howToPlay: `Euchre is a 4-player partnership trick-taking game played with a 24-card deck (9 through Ace in all 4 suits).

Teams: You and Bot 2 are partners; Bot 1 and Bot 3 are partners.

Trump Making: A card is flipped face-up (the "up card"). Going around the table, each player may "order up" that card's suit as trump, or pass. If everyone passes, a second round lets players name any other suit as trump. The team that names trump are the "makers."

Special cards — Bowers: The Jack of the trump suit is the "right bower," the highest trump card. The Jack of the same-color suit becomes the "left bower," the second-highest trump (and counts as a trump card for following suit purposes).

Play: 5 tricks are played. You must follow the led suit (remembering the left bower counts as trump suit). The highest trump wins; otherwise the highest card of the led suit wins.

Scoring: If the making team takes 3 or 4 tricks: 1 point. If they take all 5 (march): 2 points. If defenders hold the makers to fewer than 3 tricks (euchre): defenders earn 2 points.

Controls: Click "Order Up" to make trump from the up card, or "Pass." In round 2, click a suit to name it. During play, click a card to play it (legal cards are highlighted).`,
  settings: euchreSettings,
  initialState: (seed: number, settings: EuchreSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: EuchreState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-euchre-primary"]', pulses: 3 };
  },
  component: Euchre,
};
