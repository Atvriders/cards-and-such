import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ForTheQueenSagaState, ForTheQueenSagaAction, ForTheQueenSagaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForTheQueenSagaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const forTheQueenSagaPlugin: GamePlugin<ForTheQueenSagaState, ForTheQueenSagaAction, typeof settings> = {
  id: "for-the-queen-saga",
  title: "For The Queen Saga",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo storytelling homage to For the Queen — choose how the queen is loved or lost.",
  howToPlay: "For The Queen Saga is a solo journaling homage to Alex Roberts' For the Queen, a story-prompt card game where a small retinue commits to protecting (or abandoning) their queen across a long journey. The original plays in ~30 minutes around a table; this version compresses to a 10-entry solo log.\n\nEach entry presents a prompt about your relationship with the queen — what you noticed, how you advised her, when you doubted. Pick one of four choices A-D; each assigns a base reward plus 0-20 variance via the seeded oracle.\n\nBold loyalty earns differently from quiet observation. Betrayal has its own reward. There is no win condition; the story itself is the score.\n\nThe For The Drama and For The Crown variants explore similar mechanics with different settings. This compact homage preserves the questions-and-answers core that gives the original its emotional weight.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForTheQueenSagaSettings),
  reducer, isTerminal, hint: (state: ForTheQueenSagaState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-for-the-queen-saga-primary"]', pulses: 3 } : null), component: ForTheQueenSagaGame,
};
