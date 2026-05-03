import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FoxInTheForestState, FoxInTheForestAction, FoxInTheForestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FoxInTheForestGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const foxInTheForestPlugin: GamePlugin<FoxInTheForestState, FoxInTheForestAction, typeof settings> = {
  id: "fox-in-the-forest", title: "The Fox in the Forest", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player trumping game with fairytale-themed special cards.",
  howToPlay: "The Fox in the Forest is a modern designer two-player trick-taking game with a fairytale theme. The deck has thirty-three cards in three suits, numbered one through eleven, with five special cards in each suit triggering effects (the Fox swaps trump, the Witch lets her play any suit, the Treasure marks tricks taken). Each round players are dealt thirteen cards with one trump card flipped. Players take tricks but must avoid taking too many — winning seven or more out of thirteen tricks gives zero points (overconfident), winning four to six gives six points, winning three or fewer gives one point per trick. In this six-round duel against the CPU, click Play Round. Strategy: aim for the four-six sweet spot. Use the fox special card to swap trump when the dealer's flip favors the opponent. Aim for at least three rounds in the bonus zone.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FoxInTheForestSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-fox-in-the-forest-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-fox-in-the-forest-next"]', pulses: 3 };
    return null;
  }, component: FoxInTheForestGame,
};
