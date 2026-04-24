import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TarneebState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";
import type { Suit } from "../../engines/deck/index.js";

export const tarneebSettings = {} as const;
type TarneebSettings = SettingsOf<typeof tarneebSettings>;
type TarneebAction =
  | { type: "bid"; tricks: number; trump: Suit }
  | { type: "play"; cardId: string };

export const tarneebPlugin: GamePlugin<TarneebState, TarneebAction, typeof tarneebSettings> = {
  id: "tarneeb",
  title: "Tarneeb",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Middle Eastern trick-taking game. Bid a number of tricks and name your trump suit.",
  howToPlay: `Tarneeb (meaning "trump" in Arabic) is a beloved trick-taking card game popular across the Arab world, especially in Lebanon, Syria, and Egypt. It is traditionally played by four players in two teams, but this version is simplified to two players.

Setup: A standard 52-card deck is dealt — 13 cards to each player. Card rank: Ace (highest), K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2 (lowest).

Bidding: You start by bidding how many tricks (out of 13) you expect to win, and naming the trump suit. The minimum bid is 7. Your bid sets the contract.

Playing: The bidder leads the first trick. On each trick, both players play one card. You must follow the led suit if possible. If you cannot, you may play any card (including trump).

Winning a trick: A trump card beats any non-trump card. Otherwise, the highest card of the led suit wins.

Scoring: If you make your bid (win at least that many tricks), you earn positive points equal to your bid. If you fall short, you lose that many points.

Strategy: Count high cards and trump cards before bidding. Bid conservatively — failing your bid hurts more than bidding lower and making it!`,
  settings: tarneebSettings,
  initialState: (seed: number, _settings: TarneebSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Game,
};
