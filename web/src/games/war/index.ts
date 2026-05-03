import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type WarState, type WarAction } from "./state.js";
const War = /* @__PURE__ */ lazy(() => import("./War.js").then((mod) => ({ default: mod.War as unknown as React.ComponentType<unknown> })));
export const warSettings = {
  autoPlay: { kind: "boolean" as const, label: "Auto-play whole game", default: false },
} as const;

export const warPlugin: GamePlugin<WarState, WarAction, typeof warSettings> = {
  id: "war",
  title: "War",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Highest card wins each round. Ties mean WAR!",
  howToPlay: `Deplete the bot's entire deck of cards before yours runs out. A standard 52-card deck is split evenly — 26 cards each — and play proceeds one round at a time.

Click "Play Round" to reveal the top card from each deck and compare them. Aces count as 14 (highest). The player with the higher card takes both cards and adds them to the bottom of their deck. If you want to skip ahead, click "Auto-play" to instantly resolve the rest of the game. When the two top cards tie, WAR is declared: each side places 3 cards face-down and 1 face-up, and those face-up cards determine who takes the whole pile. If either side runs out of cards mid-war, the other player wins immediately. The game also ends after 500 rounds — whoever holds more cards at that point wins; equal counts are a draw.

Scoring: a win scores max(100, 500 − rounds played), rewarding quick victories. A loss scores 0 and a draw scores 50.

Tips: the game is entirely deterministic — no decisions to make — so sit back and enjoy the chaos, or just hit Auto-play.`,
  settings: warSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: WarState): HintTarget | null => {
    if (state.winner !== null) return null;
    return { selector: '[data-testid="hint-target-war-play"]', pulses: 3 };
  },
  component: War,
};
