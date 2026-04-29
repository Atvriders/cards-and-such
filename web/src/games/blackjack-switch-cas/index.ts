import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackjackSwitchCasState, BlackjackSwitchCasAction, BlackjackSwitchCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackjackSwitchCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blackjackSwitchCasPlugin: GamePlugin<BlackjackSwitchCasState, BlackjackSwitchCasAction, typeof settings> = {
  id: "blackjack-switch-cas", title: "Blackjack Switch (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play two hands and swap top cards.",
  howToPlay: "Blackjack Switch is a Blackjack variant where the player plays two hands at once and may swap the top cards between them after the deal. The swap is the key strategic decision and lets the player engineer better hands.\n\nIn this single-player version you play fifteen rounds against the dealer. Each round press Play to deal two hands of two cards each to you, plus one face-up and one face-down card to the dealer. You may swap the top cards if it improves your hands. Then play each hand independently with hit/stand.\n\nThe house pays even money on Blackjack (not 3:2) to compensate for the swap power, and the dealer ties on twenty-two. A win pays twenty points per hand. A strong total across fifteen rounds is around three hundred.\n\nBlackjack Switch was patented by Geoff Hall in 2000 and is offered at many casinos. The optimal swap rule is non-trivial and table charts are widely available. Press Play to deal both hands.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlackjackSwitchCasSettings),
  reducer, isTerminal, component: BlackjackSwitchCasGame,
};
