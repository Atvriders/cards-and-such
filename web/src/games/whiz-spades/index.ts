import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhizSpadesState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WhizSpades } from "./WhizSpades.js";

const whizSpadesSettings = {} as const;
type WhizSpadesSettings = SettingsOf<typeof whizSpadesSettings>;
type WhizSpadesAction = { type: "play"; cardId: string };

export const whizSpadesPlugin: GamePlugin<WhizSpadesState, WhizSpadesAction, typeof whizSpadesSettings> = {
  id: "whiz-spades",
  title: "Whiz Spades",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spades variant: bid must equal your spade count or zero (nil).",
  howToPlay: `Whiz Spades is a Spades variant where each round’s bid is constrained: you must bid either the exact number of spades in your hand or zero (nil). In this single-player duel the system bids your spade count automatically. Spades are trump. You and the bot each receive 13 cards. Then play 13 tricks: follow the led suit if able, otherwise play any card. Highest spade wins; if no spade, highest of led suit. Click cards to play. Strategy: with the bid fixed at your spade count, try to take exactly that many tricks, no more, no less. Lead long side-suits to draw out spades, save your highest spades for late, and duck when you can. Take at least your bid in tricks to win the round.`,
  settings: whizSpadesSettings,
  initialState: (seed: number, _settings: WhizSpadesSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: WhizSpades,
};
