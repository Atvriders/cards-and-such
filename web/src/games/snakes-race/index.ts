import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SnakesRaceState, SnakesRaceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SnakesRace = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SnakesRace as unknown as React.ComponentType<unknown> })));
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
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
    if (phase === "rolled") return { selector: '[data-testid="hint-target-snakes-race-confirm"]', pulses: 3 };
    if (phase === "picking") return { selector: '[data-testid="hint-target-snakes-race-confirm"]', pulses: 3 };
    if (phase === "selecting") return { selector: '[data-testid="hint-target-snakes-race-confirm"]', pulses: 3 };
    if (phase === "choosing") return { selector: '[data-testid="hint-target-snakes-race-confirm"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-snakes-race-roll"]', pulses: 3 };
  },
  component: SnakesRace,
};
