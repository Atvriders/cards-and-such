import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SnakesRaceState, SnakesRaceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnakesRace } from "./Game.js";

export const snakesRaceSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const snakesRacePlugin: GamePlugin<SnakesRaceState, SnakesRaceAction, typeof snakesRaceSettings> = {
  id: "snakes-race",
  title: "Snakes Race",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 2 dice and race to square 20 — but watch out for snake squares that bite you back!",
  howToPlay: `Snakes Race is a two-player dice race on a track of 20 squares. You play against a bot. Both start at square zero. On each turn the active player rolls two six-sided dice and advances their token by the total shown.

Four squares on the track are secretly marked as snake heads — they are revealed by their red highlight. If your token lands exactly on a snake square, it gets bitten and sent all the way back to square 1. This can be a dramatic reversal!

The first player to reach or pass square 20 wins the game. You roll first. After seeing your result, click the button to let the bot take its turn. The bot rolls automatically and resolves any snakes it hits.

Strategy tips: There is no meaningful strategy since you can't control the dice, but watch the snake squares early — avoid gambling roll totals that could land you on one. The four snake positions are randomly generated each game from a seeded deck, so every game board is different.

Race fast, avoid the fangs, and reach the finish line!`,
  settings: snakesRaceSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SnakesRace,
};
