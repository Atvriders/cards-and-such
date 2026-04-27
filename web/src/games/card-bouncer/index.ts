import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBouncerState, CardBouncerAction, CardBouncerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardBouncerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardBouncerPlugin: GamePlugin<CardBouncerState, CardBouncerAction, typeof settings> = {
  id: "card-bouncer", title: "Card Bouncer", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Accept or reject 12 drawn cards. Reject = redraw, but only once per slot.",
  howToPlay: `Card Bouncer is a high-stakes selectivity game. You're the bouncer at the door — each draw shows you a card, and you decide: ACCEPT (admit it; score points equal to its rank) or REJECT (bounce it back; redraw a fresh card for the same slot).

Card values: Ace = 14, King = 13, Queen = 12, Jack = 11, 10 = 10, then down through 9, 8, ..., 2 = 2.

The catch: you can only reject once per slot. After one bounce, the next card forces you to either accept it (or auto-accept it for 0 points). So if you reject and then receive another low card, you're stuck — your score for that slot is 0 (auto-accept) or the card's rank (manual accept). Rejecting is risky but lets you swap a 2 for what could be an Ace.

There are 12 draws per game. Average accept value is around 8 (the mean rank), so a no-reject strategy averages roughly 96 points. Maximum theoretical is 12 x 14 = 168 points (all Aces). Smart use of rejections can lift solid runs to 110+ points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardBouncerSettings),
  reducer, isTerminal, component: CardBouncerGame,
};
