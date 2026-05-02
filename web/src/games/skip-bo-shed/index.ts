import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkipBoShedState, SkipBoShedAction, SkipBoShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkipBoShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const skipBoShedPlugin: GamePlugin<SkipBoShedState, SkipBoShedAction, typeof settings> = {
  id: "skip-bo-shed", title: "Skip Bo", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sequence-building shedding from the stockpile to play centre piles.",
  howToPlay: "Skip Bo is a stockpile shedding card game — players race to empty a face-down stockpile by playing cards in ascending sequence to centre piles. In this auto-play version, you are dealt a stockpile of ten cards and a hand of four. The engine then plays as many cards as legally possible to centre piles that build from one upward.\n\nEach card successfully played from the stockpile scores three points; each card played from the hand scores one. Wild cards (the 13s) jump in at any value and act as flexible bridges. The round ends when no more legal plays exist.\n\nSix rounds are played. A round average scores around fifteen to twenty-five points; an excellent run can hit forty per round. Total expected: 100-130 points across six rounds; lucky games push past 180.\n\nThere are no decisions to make in this short version — the engine plays optimally each round. Just watch the stockpile drain and the centre piles climb.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SkipBoShedSettings),
  reducer, isTerminal, 
  hint: (state: SkipBoShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-skip-bo-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-skip-bo-shed-next"]', pulses: 3 };
    return null;
  },
  component: SkipBoShedGame,
};
