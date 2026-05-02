import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackjackSwitchCasState, BlackjackSwitchCasAction, BlackjackSwitchCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackjackSwitchCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blackjackSwitchCasPlugin: GamePlugin<BlackjackSwitchCasState, BlackjackSwitchCasAction, typeof settings> = {
  id: "blackjack-switch-cas", title: "Blackjack Switch", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack Switch — swap cards between hands. Even money on BJ.",
  howToPlay: "Blackjack Switch — swap cards between hands. Even money on BJ. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.0:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BlackjackSwitchCasSettings),
  reducer, isTerminal, component: BlackjackSwitchCasGame,
};
