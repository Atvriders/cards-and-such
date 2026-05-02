import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CanastaCalienteRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const canastaCalienteRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "canasta-caliente-r", title: "Canasta Caliente", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heat-themed scoring Canasta variant with hot-rank bonuses.",
  howToPlay: "Canasta Caliente brings a heat theme to the canasta family: your warmest melds count for the most. Eleven cards are dealt per round and the engine auto-melds them, scoring sets and runs. Five rounds play out, with deadwood working against you and a Canasta-out bonus for emptying your hand.\n\nStandard meld scoring applies — twenty base points for any set or run of three, with five extra for every card above three. The auto-meld algorithm prefers sets first, then suit-runs, identifying the best legal melds it can extract from your eleven-card draw. Aces count one, face cards ten, others their pip value.\n\nThe twist of Caliente is timing: hands with naturally clustered ranks tend to roar, while scattered seeds barely simmer. After all five rounds, total points become your final score. Expect averages around a hundred to two hundred, with hot streaks pushing higher when sets line up. Click 'Auto-score' each round, then 'Next' to deal again.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-canasta-caliente-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-canasta-caliente-r-next"]', pulses: 3 };
    return null;
  },
  component: CanastaCalienteRGame,
};
