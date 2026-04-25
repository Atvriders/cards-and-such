import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MorabarabaState, MorabarabaAction, MorabarabaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Morabaraba } from "./Game.js";

const settings = {} as const;

export const morabarabaPlugin: GamePlugin<MorabarabaState, MorabarabaAction, typeof settings> = {
  id: "morabaraba",
  title: "Morabaraba",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "South African 12 Men's Morris — place cows, form mills, remove opponents to win.",
  howToPlay: `Morabaraba is the national board game of South Africa, played by millions across the continent. It is a variant of Twelve Men's Morris. The board shows three nested squares connected by lines. You play gold cows; the bot plays dark cows.

The game has two phases. In the Placement phase, players take turns placing one cow at a time on any empty intersection — you have 12 cows each. In the Movement phase, you slide a cow along a line to an adjacent empty point. If you have only 3 cows left, you may fly to any empty point.

Whenever three of your cows align in a straight row along a board line, you form a mill. Immediately click any opponent cow that is not in a mill to remove it (if all opponent cows are in mills, you may remove any). Reduced to fewer than 3 cows, or with no legal moves, and you lose.

Strategy: build mills that can be opened and closed repeatedly. Protect your cows while breaking opponent formations. The bot uses minimax search at depth 3.`,
  settings,
  initialState: (seed: number, s: MorabarabaSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Morabaraba,
};
