import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ProgressiveRummyRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const progressiveRummyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "progressive-rummy-r", title: "Progressive Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Contract rummy with increasing meld demands across seven rounds.",
  howToPlay: "Progressive Rummy is a contract rummy variant where the meld targets grow more demanding round by round. Seven rounds are played; each round deals you a fresh seven-card hand which the engine auto-melds into sets and runs.\n\nThe engine identifies sets (three or more equal ranks) and runs (three or more consecutive same-suit cards) and scores them at twenty base plus five per card past three. While this implementation does not enforce per-round meld contracts strictly, the seven-round flow recreates the progressive feel: more rounds, more chances to capitalize on lucky deals.\n\nCards remaining outside melds form deadwood (aces one, face cards ten, others pip value) and reduce no points but also yield no scoring. Going out — emptying your hand entirely — adds twenty-five-point bonus. Across seven rounds, expected totals run seventy to two hundred ten. Click 'Auto-score' to lock and 'Next' to deal. Progressive Rummy rewards persistence: even one or two big rounds out of seven can carry you.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-progressive-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-progressive-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: ProgressiveRummyRGame,
};
