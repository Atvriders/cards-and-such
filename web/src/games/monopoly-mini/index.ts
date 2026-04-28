import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonopolyState, MonopolyAction, MonopolySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonopolyMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const monopolyMiniPlugin: GamePlugin<MonopolyState, MonopolyAction, typeof settings> = {
  id: "monopoly-mini",
  title: "Monopoly Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "8-square monopoly path vs CPU. Buy properties, collect rent, bankrupt the CPU.",
  howToPlay: `Monopoly Mini distills the 1935 Hasbro classic onto an 8-square board. You play one human against a greedy CPU opponent on a tiny circular path with five purchasable properties and three free squares.

How to play:
1. You and the CPU each start at square 0 with $500 cash.
2. On your turn press Roll to roll a 6-sided die and advance 1-6 squares (wrapping around the loop).
3. If the square is unowned and priced, you choose Buy or Skip. Prices are $60, $80, $120, $140, $200; rents are $15, $20, $35, $40, $60.
4. If the square belongs to the CPU you pay its rent. If it's yours, nothing happens.
5. After your turn press CPU Turn — the CPU rolls and buys greedily whenever it can afford. Pay it rent if you land on its property.

The game ends when one player goes bankrupt (cash below $0), or after 20 turns whoever has more cash wins.

Score = your cash – CPU cash + 500, plus a 500 bonus for outright winning. Aim above 1000 for a clean win, 500 for a coin-flip finish.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonopolySettings),
  reducer,
  isTerminal,
  component: MonopolyMiniGame,
};
