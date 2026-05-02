import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BlackjackSwitchCasState, BlackjackSwitchCasAction, BlackjackSwitchCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackjackSwitchCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: BlackjackSwitchCasState): HintTarget | null => (state.phase === "play" ? { selector: '[data-testid="hint-target-blackjack-switch-cas-primary"]', pulses: 3 } : null);
export const blackjackSwitchCasPlugin: GamePlugin<BlackjackSwitchCasState, BlackjackSwitchCasAction, typeof settings> = {
  id: "blackjack-switch-cas", title: "Blackjack Switch", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack Switch — swap cards between hands. Even money on BJ.",
  howToPlay: "Blackjack Switch — swap cards between hands. Even money on BJ. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.0:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BlackjackSwitchCasSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-blackjack-switch-cas-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.yourTotal;
    if (total < 12) return { selector: '[data-testid="hint-target-blackjack-switch-cas-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-blackjack-switch-cas-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-blackjack-switch-cas-hit"]', pulses: 3 };
  },
  reducer, isTerminal, hint, component: BlackjackSwitchCasGame,
};
