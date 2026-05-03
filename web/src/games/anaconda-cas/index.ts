import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-anaconda-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-anaconda-cas-secondary"]', pulses: 3 };
  return null;
};
export const anacondaCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "anaconda-cas",
  title: "Anaconda",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pass-three draw poker; multi-round dealer-choice.",
  howToPlay: "Anaconda is a pass-three draw poker variant where each player is dealt seven cards, then passes three to the player on their left, then receives three from the player on their right, then discards two for a final five-card showdown.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal seven cards to you and seven to the dealer; an automatic optimal pass picks the three least-needed cards to pass. After exchange, both reduce to five cards and compare. Stronger hand pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Anaconda is a quintessential dealer's-choice home game found in stud rotations across the Midwest and Northeast. The pass-three mechanic creates information complexity (you know what your right opponent passed) that distinguishes it from straight draw poker. Watch your final hand carefully — discards matter.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
