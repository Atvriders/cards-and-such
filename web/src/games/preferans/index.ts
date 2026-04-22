import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PrefState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Preferans } from "./Preferans.js";

export const preferansSettings = {} as const;
type PrefSettings = SettingsOf<typeof preferansSettings>;
type PrefAction =
  | { type: "bid" }
  | { type: "pass" }
  | { type: "play"; cardId: string };

export const preferansPlugin: GamePlugin<PrefState, PrefAction, typeof preferansSettings> = {
  id: "preferans",
  title: "Preferans",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Eastern European 3-player trick-taking game with bidding, a 2-card talon, and a declarer vs. defenders structure.",
  howToPlay: `Preferans is a beloved card game across Eastern Europe (Russia, Austria, Balkans), played by 3 players with a 32-card deck (7 through Ace of each suit). Each player receives 10 cards; 2 cards form the "talon" (widow).

**Bidding:** Decide whether to bid or pass. If you bid, you become the declarer: you pick up the talon, incorporate the best cards into your hand (discarding your 2 weakest), and name the trump suit. Your contract: take at least 6 of the 10 tricks. If you pass, the bots bid among themselves and you become a defender.

**Declarer vs. Defenders:** The declarer plays alone against the two defenders, who cooperate to stop the declarer from meeting their contract.

**Card Values:** Ace=11, Ten=10, King=4, Queen=3, Jack=2, others=0.

**Play:** Must follow suit. If you cannot follow suit, you must trump. If no trump either, discard any card. The highest trump wins; otherwise the highest card of the led suit wins.

**Winning:** If declarer, you win by taking 6+ tricks. If defender, you win by holding the declarer under their contract. Your score reflects tricks won relative to the contract target.

**Strategy:** Count outs carefully — the talon gives the declarer a real edge in trumps and high cards.`,
  settings: preferansSettings,
  initialState: (seed: number, _settings: PrefSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Preferans,
};
