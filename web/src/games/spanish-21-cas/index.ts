import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Spanish21CasState, Spanish21CasAction, Spanish21CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Spanish21CasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const spanish21CasPlugin: GamePlugin<Spanish21CasState, Spanish21CasAction, typeof settings> = {
  id: "spanish-21-cas", title: "Spanish 21", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack with 48-card deck (no 10s).",
  howToPlay: "Spanish 21 is a Blackjack variant played with forty-eight-card Spanish decks (the four tens are removed) and rich bonus payouts. The missing tens are bad for the player but the bonus rules — 5-card 21, 6-card 21, 7-card 21, plus suited 6-7-8 and 7-7-7 specials — more than compensate.\n\nIn this single-player version you play fifteen rounds against the dealer. Each round press Play to deal two cards to you and the dealer. Make standard hit/stand decisions and the dealer plays out their hand by the standard rules.\n\nA win pays twenty points; a Blackjack pays thirty; bonus 5+ card 21s pay forty; suited 7-7-7 pays a sixty-point jackpot. The dealer's hole card is concealed. A strong total across fifteen rounds is around two hundred and fifty points; a 7-7-7 jackpot can carry a session.\n\nSpanish 21 first appeared in Las Vegas in 1995 and remains a popular alternative to Blackjack. The house edge is roughly 0.4% with optimal play. Press Play to deal the next round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Spanish21CasSettings),
  reducer, isTerminal, component: Spanish21CasGame,
};
