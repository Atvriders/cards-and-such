import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleAttackBjState, DoubleAttackBjAction, DoubleAttackBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleAttackBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const da-bjPlugin: GamePlugin<DoubleAttackBjState, DoubleAttackBjAction, typeof settings> = {
  id: "double-attack-bj", title: "Double Attack Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Double Attack Blackjack — Spanish deck (no 10s), BJ pays even money.",
  howToPlay: "Double Attack Blackjack — Spanish deck (no 10s), BJ pays even money. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.0:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as DoubleAttackBjSettings),
  reducer, isTerminal, component: DoubleAttackBjGame,
};
