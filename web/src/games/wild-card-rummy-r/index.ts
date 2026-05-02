import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WildCardRummyRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const wildCardRummyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "wild-card-rummy-r", title: "Wild Card Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Basic rummy with wild-card flexibility for completing melds.",
  howToPlay: "Wild Card Rummy adds flexibility to standard rummy by letting jokers or chosen wilds fill any slot in a meld. In this implementation, the auto-melder treats your hand generously: every meld of three-or-more matching ranks or three-or-more consecutive same-suit cards counts, no matter how the wilds would actually distribute.\n\nSeven cards are dealt each of six rounds. The engine auto-detects sets and runs; each meld scores twenty base points plus five for every card past three. Deadwood — leftover cards — counts against bare hands: aces one, face cards ten, others pip value. With no melds at all, you get a tiny consolation of one point per five points of deadwood reduction.\n\nGoing out completely (no deadwood) adds a twenty-five-point bonus. Across six rounds, expected totals range from sixty to one-eighty. Click 'Auto-score' each round and 'Next' to advance. Wild-friendly seeds reward you generously; tight, rank-scattered hands earn modest rounds.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-wild-card-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-wild-card-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: WildCardRummyRGame,
};
