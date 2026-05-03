import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Phase10State, Phase10Action, Phase10Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Phase10Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const phase10Plugin: GamePlugin<Phase10State, Phase10Action, typeof settings> = {
  id: "phase-10", title: "Phase 10", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shedding with sequential phase objectives — sets and runs.",
  howToPlay: "Phase 10 is a popular shedding card game where players race through ten increasingly difficult phase objectives — phase 1 is two sets of three, phase 2 is a set of three plus a run of four, and so on through to phase 10 (a run of nine). Each phase must be played down to the table before further play; once down, you can hit other players' phases by adding matching cards. Whoever empties their hand first wins the round; only those who completed their phase advance to the next. In this one-on-one CPU duel across six phases, click Play Round to simulate the deal, phase-meld attempts, and shedding. Strategy: focus on completing the current phase even if it means holding extra cards rather than going out without melding. Aim to advance through at least three phases and beat the CPU on the final scoring. A negative penalty score under fifty is excellent — you played fast and meldful.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Phase10Settings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-phase-10-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-phase-10-next"]', pulses: 3 };
    return null;
  }, component: Phase10Game,
};
