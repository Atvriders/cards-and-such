import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BadugiState, BadugiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Badugi } from "./Badugi.js";

export const badugiSettings = {
  startingBankroll: {
    kind: "enum" as const,
    label: "Starting Bankroll",
    options: ["500", "1000", "5000"] as const,
    default: "1000",
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
} as const;

type BadugiSettingsType = SettingsOf<typeof badugiSettings>;

export const badugiPlugin: GamePlugin<BadugiState, BadugiAction, typeof badugiSettings> = {
  id: "badugi",
  title: "Badugi",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-card draw lowball — make the best Badugi: 4 cards all different suits and ranks.",
  howToPlay: `Badugi is a unique 4-card draw poker variant where the goal is to make the lowest possible hand with all four cards of different suits and different ranks — called a "Badugi."

Each player is dealt 4 cards. The hand with the most qualifying cards wins; if both players have a Badugi (4 qualifying cards), the player with the lower high card wins. Aces are low (best card).

A Badugi hand is ranked by the number of effective cards: a 4-card Badugi always beats a 3-card Badugi, which beats a 2-card Badugi. If two hands have the same number of effective cards, compare the highest card in each — lower wins. Then compare the next highest if needed.

Hands with duplicate suits or duplicate ranks have those duplicates "discounted" — you play only the qualifying subset.

The game has 3 betting rounds alternating with 3 draw rounds: Bet → Draw → Bet → Draw → Bet → Draw → Showdown. Each draw, select cards to discard and replacement cards are dealt.

Strategy: discard cards that share a suit or rank with your better cards. Keep the lowest cards you can while maintaining different suits. Standing pat (not drawing) signals a strong hand.

Settings: Starting Bankroll ($500/$1000/$5000), Ante Size ($10/$25/$50). The game ends when one player goes bust.`,
  settings: badugiSettings,
  initialState: (seed: number, settings: BadugiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Badugi,
};
