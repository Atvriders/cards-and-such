import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-badacey-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-badacey-cas-secondary"]', pulses: 3 };
  return null;
};
export const badaceyCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "badacey-cas",
  title: "Badacey",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Combined Badugi + A-5 Triple Draw lowball.",
  howToPlay: "Badacey is a combined Badugi and A-5 Triple Draw lowball — players hold five cards through three draw rounds and the pot splits between the best Badugi (four cards of distinct suits and ranks) and the best A-5 Triple Draw lowball five-card (where straights and flushes don't count and ace-low is the goal).\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal five cards to you and five to the dealer; the engine resolves both Badugi and A-5 sides simultaneously. Winning either side pays seven; scooping (winning both) pays sixteen; tie pays four; loss pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Badacey is similar to Badeucey but rewards ace-low hands instead of seven-low — a wheel (A-2-3-4-5) of distinct suits is the holy grail. Aim for both sides; scoop big.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
