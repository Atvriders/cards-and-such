import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MultiHandBjState, MultiHandBjAction, MultiHandBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MultiHandBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const multiHandBjPlugin: GamePlugin<MultiHandBjState, MultiHandBjAction, typeof settings> = {
  id: "multi-hand-bj", title: "Multi-Hand Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Multi-Hand Blackjack — single-hand presentation.",
  howToPlay: "Multi-Hand Blackjack — single-hand presentation. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as MultiHandBjSettings),
  reducer, isTerminal, component: MultiHandBjGame,
};
