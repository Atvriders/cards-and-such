import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TractorState, TractorAction, TractorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TractorGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tractorPlugin: GamePlugin<TractorState, TractorAction, typeof settings> = {
  id: "tractor", title: "Tractor (Sheng Ji)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese partnership climbing card game also called Sheng Ji.",
  howToPlay: "Tractor, also called Sheng Ji or '80 Points', is a Chinese partnership climbing card game played with two decks (one hundred eight cards including jokers). Partners aim to score eighty points to climb levels — each successful round increases the trump rank up the ladder from two through ace. Plays are singles, pairs, tractors (consecutive pairs), and triples; the trump rank in any suit beats off-trumps. The defending team must catch the attackers below the level threshold to retain control. In this simplified one-on-one CPU duel across six rounds, click Play Round to deal twenty-five-card hands and play. Strategy: identify and exploit your tractor pairs early to dominate trick play. Save the big and small jokers for emergencies — they are the highest trumps. Aim to climb at least two levels across the match. A total score above two hundred is a respectable Tractor result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TractorSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-tractor-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-tractor-next"]', pulses: 3 };
    return null;
  }, component: TractorGame,
};
