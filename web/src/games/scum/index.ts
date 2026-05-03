import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScumState, ScumAction, ScumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScumGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const scumPlugin: GamePlugin<ScumState, ScumAction, typeof settings> = {
  id: "scum", title: "Scum", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "American President variant where the loser is called Scum.",
  howToPlay: "Scum is the American name for the President shedding card game family. Players race to empty their hands by playing singles, pairs, triples, or quads of equal-or-higher rank than the previous play. Whoever goes out first becomes President for the next round; the last player out is Scum. At the start of each new deal Scum gives their two best cards to President, who returns two low cards. The hierarchy creates a tense gameplay loop where Scum struggles to climb back. Special cards: 2s reset the pile, 10s burn it. In this six-round CPU duel with the social-hierarchy swap rule, click Play Round. Strategy: hold back at least one 2 to bomb the pile when your hand is locked. Aim to be President on the final round to win the match. Achieving President at least twice across six rounds is a respectable Scum finish; a total score above one hundred is excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScumSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-scum-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-scum-next"]', pulses: 3 };
    return null;
  }, component: ScumGame,
};
