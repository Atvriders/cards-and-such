import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlaverjasState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Klaverjas = /* @__PURE__ */ lazy(() => import("./Klaverjas.js").then((mod) => ({ default: mod.Klaverjas as unknown as React.ComponentType<unknown> })));
export const klaverjasSettings = {} as const;
type KlaverjasSettings = SettingsOf<typeof klaverjasSettings>;
type KlaverjasAction = { type: "play"; cardId: string };

export const klaverjasPlugin: GamePlugin<KlaverjasState, KlaverjasAction, typeof klaverjasSettings> = {
  id: "klaverjas",
  title: "Klaverjas",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Dutch 4-player partnership trick-taking game with special trump card values.",
  howToPlay: `Klaverjas is the most popular card game in the Netherlands, played in partnerships (you and the player opposite you vs. the other two).

**Deck & Deal:** A 32-card deck (7 through Ace) is used. Each player receives 8 cards. Trump is determined by the first card dealt to the second player — that card's suit becomes the trump suit for the hand.

**Special Trump Values:** The Jack of trumps ("Jass") is worth 20 points and is the highest trump. The 9 of trumps ("Menel") is worth 14 points. All other trumps: Ace=11, Ten=10, King=4, Queen=3.

**Off-suit Values:** Ace=11, Ten=10, King=4, Queen=3, Jack=2, others=0.

**Play:** You must follow the led suit. If you can't follow suit, you may trump or discard. The highest trump wins a trick; if no trump, the highest card of the led suit wins. Play 8 tricks total.

**Scoring:** Add up all card values won by each partnership. The team winning the last trick earns a 10-point bonus ("stuk"). Team with the most points wins.

**Strategy:** The Jass (trump Jack) and Menel (trump 9) are your most powerful weapons — save them for high-value tricks.`,
  settings: klaverjasSettings,
  initialState: (seed: number, _settings: KlaverjasSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: KlaverjasState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-klaverjas-primary"]', pulses: 3 };
  },
  component: Klaverjas,
};
