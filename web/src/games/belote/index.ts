import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeloteState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Belote = /* @__PURE__ */ lazy(() => import("./Belote.js").then((mod) => ({ default: mod.Belote as unknown as React.ComponentType<unknown> })));
export const beloteSettings = {} as const;
type BeloteSettings = SettingsOf<typeof beloteSettings>;
type BeloteAction =
  | { type: "accept" }
  | { type: "pass" }
  | { type: "play"; cardId: string };

export const belotePlugin: GamePlugin<BeloteState, BeloteAction, typeof beloteSettings> = {
  id: "belote",
  title: "Belote",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic French 4-player partnership trick-taking game with special trump card values.",
  howToPlay: `Belote is France's most popular card game, played with a 32-card deck (7 through Ace) in partnerships: you and the player across from you vs. the other two.

**Trump Selection:** A card is turned face-up. You may accept that card's suit as trump, or pass. If you pass, a bot with the strongest hand in that suit auto-accepts — trump is always chosen this way.

**Special Trump Values (Jass/Menel):** The Jack of trumps ("Jass") is worth 20 points and tops all trumps. The 9 of trumps ("Menel") scores 14 points and ranks second. Other trumps: Ace=11, Ten=10, King=4, Queen=3. Off-suit: Ace=11, Ten=10, King=4, Queen=3, Jack=2, others=0.

**Play:** 8 tricks are played. You must follow the led suit. If you cannot follow, you must trump if you have a trump. The highest trump wins a trick; otherwise the highest card of the led suit wins.

**Scoring:** Each team totals their card values. The team winning the last trick earns a 10-point bonus. Total points in the deck equal 162. The declaring team needs 82+ points to win.

**Strategy:** Save Jass and Menel for power tricks. Lead trump early to draw out the opponents' Jass if you hold the Menel.`,
  settings: beloteSettings,
  initialState: (seed: number, _settings: BeloteSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: BeloteState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-belote-primary"]', pulses: 3 };
  },
  component: Belote,
};
