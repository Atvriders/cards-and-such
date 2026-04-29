import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const badeuceyCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "badeucey-cas",
  title: "Badeucey",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Combined Badugi + 2-7 Triple Draw lowball.",
  howToPlay: "Badeucey is a combined Badugi and 2-7 Triple Draw lowball — players hold five cards through three draw rounds and the pot splits between the best Badugi (four cards of distinct suits and ranks) and the best 2-7 Triple Draw lowball five-card.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal five cards to you and five to the dealer; the engine resolves both Badugi and 2-7 sides simultaneously. Winning either side pays seven; scooping (winning both) pays sixteen; tie pays four; loss pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Badeucey is a staple of the SHOE rotation and high-stakes mixed-game cash. The dual-side requirement rewards balanced low-card-distinct-suit hands like 2-3-4-5-7 of mixed suits — the dream Badeucey hand. Aim for both sides; scoop big.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  component: CasGame,
};
