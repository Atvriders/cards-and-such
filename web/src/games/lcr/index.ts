import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LCRState, LCRAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LCRGame } from "./Game.js";

export const lcrSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const lcrPlugin: GamePlugin<LCRState, LCRAction, typeof lcrSettings> = {
  id: "lcr",
  title: "Left Center Right",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic chip-passing dice game — roll L, C, R, or * and be the last player holding chips.",
  howToPlay: `Left Center Right (LCR) is a fast and luck-filled dice game for three players. Each player starts with three chips. On your turn you roll up to three special dice — one die per chip you hold, but never more than three.

Each die face shows one of four results: L (left), C (center), R (right), or a dot (*). For every L you roll, pass one of your chips to the player on your left. For every R, pass one chip to the player on your right. For every C, drop one chip into the center pot. A dot means you keep that chip safe.

The game continues clockwise. If you run out of chips you still take turns — you just roll zero dice and wait. You are still alive as long as chips can flow back to you from neighbors. The moment only one player has any chips left, that player wins the entire pot plus any chips remaining in hand.

Playing against bots: Bot A sits to your left, Bot B to your right. Click Roll Dice on your turn, then Next Turn to advance. Bots resolve automatically. Good luck — everything is in the dice!`,
  settings: lcrSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LCRGame,
};
