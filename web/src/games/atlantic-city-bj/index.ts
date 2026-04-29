import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AtlanticCityBjState, AtlanticCityBjAction, AtlanticCityBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AtlanticCityBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const atlanticCityBjPlugin: GamePlugin<AtlanticCityBjState, AtlanticCityBjAction, typeof settings> = {
  id: "atlantic-city-bj", title: "Atlantic City Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Atlantic City rule-set Blackjack against the dealer.",
  howToPlay: "Atlantic City Blackjack is the standard Blackjack rule-set used in casinos along the New Jersey shore. The dealer hits soft 17, players may double after split, and surrender is offered. The result is a slightly player-friendly variant of standard Blackjack.\n\nIn each of twelve rounds you and the dealer are dealt two cards each, with one dealer card hidden. You may hit (take more cards) or stand (end your turn). Aces count eleven (or one if you would otherwise bust); pip cards face value; faces count ten. Bust at twenty-two-or-more and you lose immediately.\n\nA standard win pays twelve points; a push pays five; a Blackjack (twenty-one on the first two cards) pays eighteen. The dealer plays automatically: hit until seventeen-or-more, stand thereafter.\n\nExpected score across twelve rounds is fifty-five to ninety. Stand on hard seventeen-or-more, hit on twelve-or-less; the standard charts apply. A single Blackjack adds eighteen to your total — keep an eye out for early aces.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AtlanticCityBjSettings),
  reducer, isTerminal, component: AtlanticCityBjGame,
};
