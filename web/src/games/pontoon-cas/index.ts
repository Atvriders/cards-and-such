import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PontoonCasState, PontoonCasAction, PontoonCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PontoonCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pontoonCasPlugin: GamePlugin<PontoonCasState, PontoonCasAction, typeof settings> = {
  id: "pontoon-cas", title: "Pontoon", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British Blackjack variant.",
  howToPlay: "Pontoon is the British and Australian Blackjack variant. Key differences include: dealer wins all ties, both dealer cards are face down, and a 'five-card trick' (five cards totaling twenty-one or under) pays an enhanced 2:1.\n\nIn this single-player version you play fifteen rounds against the dealer. Each round press Play to deal. Both your cards are visible; both dealer cards are hidden. Choose hit, stand, twist, or buy. A natural Pontoon (Ace + 10/J/Q/K) pays double (2:1).\n\nWin twenty points per beat; Pontoon pays forty; five-card trick pays thirty. A strong total across fifteen rounds is around two hundred. Pontoon dates to the British Royal Navy in the late nineteenth century, played by sailors during long voyages. The name comes from a slang corruption of 'Vingt-Un'.\n\nThe game is still wildly popular in Australian pubs and British family homes. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PontoonCasSettings),
  reducer, isTerminal, component: PontoonCasGame,
};
