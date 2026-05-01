import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwentyOneThreeBjState, TwentyOneThreeBjAction, TwentyOneThreeBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwentyOneThreeBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tot-bjPlugin: GamePlugin<TwentyOneThreeBjState, TwentyOneThreeBjAction, typeof settings> = {
  id: "twenty-one-three-bj", title: "21+3 Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "21+3 Blackjack — three-card poker side bet variant.",
  howToPlay: "21+3 Blackjack — three-card poker side bet variant. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as TwentyOneThreeBjSettings),
  reducer, isTerminal, component: TwentyOneThreeBjGame,
};
