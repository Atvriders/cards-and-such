import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoppelkopfState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Doppelkopf } from "./Doppelkopf.js";

export const doppelkopfSettings = {} as const;
type DKSettings = SettingsOf<typeof doppelkopfSettings>;
type DKAction = { type: "play"; cardId: string };

export const doppelkopfPlugin: GamePlugin<DoppelkopfState, DKAction, typeof doppelkopfSettings> = {
  id: "doppelkopf",
  title: "Doppelkopf",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German 4-player partnership trick-taker with a double deck. Queens of Clubs form secret teams.",
  howToPlay: `Doppelkopf ("double head") is Germany's second most popular card game after Skat. It uses a 48-card double deck — two copies of the 9 through Ace in all four suits.

**Secret Partnerships:** The two players holding the Queens of Clubs form the "Re" team; the other two form "Kontra." Partners are initially secret and revealed only during play when a Q♣ appears. In this simplified version, teams are shown upfront.

**Trumps:** Doppelkopf has a large trump suit: all Diamonds, all Jacks, all Queens, and the 10 of Hearts. Trump ranking from highest: Q♣ > Q♠ > Q♥ > Q♦ > J♣ > J♠ > J♥ > J♦ > 10♥ > A♦ > 10♦ > K♦ > 9♦.

**Card Values:** Ace=11, Ten=10, King=4, Queen=3, Jack=2, Nine=0. Total in deck: 240 points.

**Play:** Deal 12 cards to each of 4 players. Must follow suit; trumps beat all non-trumps. Play 12 tricks.

**Winning:** The Re team needs 121+ points (more than half of 240) to win. The Kontra team wins with 120 or more.

**Strategy:** Identify your partner early and work together. High trumps like the Queens of Clubs are your most powerful cards.`,
  settings: doppelkopfSettings,
  initialState: (seed: number, _settings: DKSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: DoppelkopfState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-doppelkopf-primary"]', pulses: 3 };
  },
  component: Doppelkopf,
};
