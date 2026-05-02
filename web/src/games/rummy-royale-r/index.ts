import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RummyRoyaleRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rummyRoyaleRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "rummy-royale-r", title: "Rummy Royale", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino-branded rummy with regal meld bonus scoring.",
  howToPlay: "Rummy Royale is the casino-styled branch of rummy, played here as a five-round meld-and-score session with a touch of regal flair. Each round you draw a seven-card hand and the engine auto-melds the best sets and runs.\n\nA set is three or more cards of the same rank; a run is three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every extra card past three. Cards left outside melds form deadwood — aces count one, face cards ten, others their face value — and bare hands earn only a consolation point or two.\n\nGoing out — your hand fully melded — adds the Royale bonus of twenty-five. Across five rounds, totals range sixty to one-seventy. Click 'Auto-score' each round and 'Next' to advance. Rummy Royale leans on lucky seeds: face-card clusters score as well as low ranks, and even one big hand can pull the total north of a hundred.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-rummy-royale-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-rummy-royale-r-next"]', pulses: 3 };
    return null;
  },
  component: RummyRoyaleRGame,
};
