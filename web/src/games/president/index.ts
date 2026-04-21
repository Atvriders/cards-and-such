import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PresidentState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { President } from "./President.js";

export const presidentSettings = {
  dummy: {
    kind: "enum" as const,
    label: "Mode",
    options: ["off"] as const,
    default: "off" as const,
  },
} as const;

type PresidentAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export const presidentPlugin: GamePlugin<PresidentState, PresidentAction, typeof presidentSettings> = {
  id: "president",
  title: "President",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Climbing card game. Play higher than the last card. First out is President.",
  howToPlay: `Race to empty your hand first and claim the title of President.

Setup: 52 cards are dealt evenly — 13 each to you and 3 bots. The player holding the 3 of Clubs leads the first play.

Gameplay: the leader plays any card or group of cards of the same rank (e.g., two 7s). Each player in turn must play the same number of cards with a strictly higher rank, or pass. When all other players pass, the last player to play leads the next round (called a new "trick" or "bout"). The rank order is 3 (low) through 2 (highest), with Ace just below 2. Bots automatically play their lowest legal option or pass if they cannot beat the pile.

Finishing: when you play your last card, you are out. The order of finishing determines your title — President (first out, score 100), Vice President (second, score 60), Scum (third, score 20), or Double Scum (last, score 0).

Controls: click cards in your hand to select them (they lift up), then click Play to submit. Click Pass when you cannot or don't want to beat the current play.`,
  settings: presidentSettings,
  initialState,
  reducer,
  isTerminal,
  component: President,
};
