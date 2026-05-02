import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CanastaJuniorRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const canastaJuniorRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "canasta-junior-r", title: "Canasta Junior", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simplified kids' Canasta with smaller hands and softer scoring.",
  howToPlay: "Canasta Junior is the simplified family-friendly version of canasta, designed for younger players or those new to the meld-and-score family. Hands are smaller — nine cards instead of eleven — and only four rounds are played, making for short and forgiving sessions.\n\nEach round, the engine auto-identifies the best sets (three-plus of equal rank) and runs (three-plus of consecutive same-suit cards) in your hand. Each meld scores twenty base points plus five for each extra card past the third. Cards left over form deadwood; aces count one, face cards ten, others their pip value.\n\nGoing out — emptying your hand entirely after melding — adds a twenty-five-point Canasta-out bonus. After four rounds your scores accumulate. Expected totals run sixty to one-fifty. Click 'Auto-score' each round and then 'Next' to deal the following hand. Junior is gentle, fast, and great for warming up before tackling the full Canasta.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-canasta-junior-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-canasta-junior-r-next"]', pulses: 3 };
    return null;
  },
  component: CanastaJuniorRGame,
};
