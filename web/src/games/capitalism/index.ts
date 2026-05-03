import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CapitalismState, CapitalismAction, CapitalismSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CapitalismGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const capitalismPlugin: GamePlugin<CapitalismState, CapitalismAction, typeof settings> = {
  id: "capitalism", title: "Capitalism", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "President variant where cards swap each round to reinforce wealth.",
  howToPlay: "Capitalism is a sharper-edged variant of the President shedding card game family where the wealth-swap rule is amplified each round: the President receives the best card from every player below them, while the Scum gives up their two best cards in return for one low card. Climbing the social ladder back from Scum is intentionally difficult — a satirical jab at economic inequality. In this six-round CPU duel, click Play Round to simulate the deal, swaps, and shedding race. Strategy: as President or Vice-President, hoard your low cards (3s, 4s, 5s) for late-round finesse plays. As Scum, bombs (four-of-a-kind) and 2s are your only hope of escaping the bottom. The 8-cut rule (an eight stops the round) is your friend in tight finishes. Aim for at least one President finish across the match and a final score above ninety for a respectable Capitalism result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CapitalismSettings),
  reducer, isTerminal, hint: (state: CapitalismState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-capitalism-primary"]', pulses: 3 } : null), component: CapitalismGame,
};
