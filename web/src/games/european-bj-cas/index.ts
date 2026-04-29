import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EuropeanBjCasState, EuropeanBjCasAction, EuropeanBjCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EuropeanBjCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const europeanBjCasPlugin: GamePlugin<EuropeanBjCasState, EuropeanBjCasAction, typeof settings> = {
  id: "european-bj-cas", title: "European Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "No-hole-card European rules.",
  howToPlay: "European Blackjack differs from Vegas-style Blackjack in one key way: the dealer does not receive a hole card until after all players act. This means doubling and splitting against a dealer ace or ten can be wiped out if the dealer pulls Blackjack.\n\nIn this single-player version you play fifteen rounds against the dealer. Each round press Play to deal two cards to you and one face-up card to the dealer. Choose hit, stand, double, or split. The dealer's second card is dealt only after you finish.\n\nThis 'no peek' rule punishes aggressive splits and doubles against high upcards. A win pays twenty; a Blackjack pays thirty. A strong total across fifteen rounds is around two hundred.\n\nEuropean Blackjack is the standard variant in casinos throughout the European Union. The house edge is roughly 0.4% higher than Las Vegas Blackjack because of the no-peek rule, but the game's tempo is faster. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EuropeanBjCasSettings),
  reducer, isTerminal, component: EuropeanBjCasGame,
};
