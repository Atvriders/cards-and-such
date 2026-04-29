import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeucesWildDrawState, DeucesWildDrawAction, DeucesWildDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeucesWildDrawGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const deucesWildDrawPlugin: GamePlugin<DeucesWildDrawState, DeucesWildDrawAction, typeof settings> = {
  id: "deuces-wild-draw", title: "Deuces Wild Draw Poker", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-card draw with all twos counting as wild.",
  howToPlay: "Deuces Wild Draw Poker is a five-card draw variant in which all twos count as wild cards, dramatically improving hand frequencies. Wild deuces produce far more straights, flushes, and four-of-a-kind hands than the standard game.\n\nIn this single-player adaptation you play against the dealer over twelve rounds. Each round you are dealt five cards. The engine evaluates the hand using a poker-rank schedule: pair of jacks-or-better one point, two pair two, three-of-a-kind three, straight four, flush six, full house nine, four-of-a-kind twenty-five, straight flush fifty, royal flush two hundred and fifty. Deuces flexibility is approximated by the consistent payout structure.\n\nExpected score across twelve rounds is thirty to sixty. Deuces' wild flavour produces frequent payouts and the occasional spectacular four-of-a-kind. Hand a single straight flush in the twelve-round set and you'll punch through the top of the band; even a couple of three-of-a-kinds will land you in the upper portion.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeucesWildDrawSettings),
  reducer, isTerminal, component: DeucesWildDrawGame,
};
