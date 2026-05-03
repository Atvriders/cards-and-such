import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { OwareState, OwareAction, OwareSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Oware = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Oware as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const owarePlugin: GamePlugin<OwareState, OwareAction, typeof settings> = {
  id: "oware",
  title: "Oware",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "West African mancala — capture by sowing to 2 or 3 seeds.",
  howToPlay: `Oware (also called Awari) is the most popular variant of the mancala family from West Africa. Unlike the store-based Kalah, Oware has no stores — seeds are captured to your score tally instead.

The board has two rows of six pits (12 pits total). Each pit starts with 4 seeds. You control the bottom row; the bot controls the top row. 48 seeds total; most captured seeds wins.

On your turn, choose one of your pits that has seeds. Pick up all seeds from that pit and distribute them counterclockwise one per pit, skipping no pits (but skipping your original pit if you have 12+ seeds). If the last seed you place lands in one of the OPPONENT's pits and brings its total to exactly 2 or 3 seeds, you capture those seeds. Captured seeds score for you. You then continue backwards from that pit: if the previous opponent pit also now has 2 or 3 seeds, capture those too (chain capture).

Exception — Grand Slam: if a single move would capture all of an opponent's seeds at once, the move is played normally but no capture occurs. The game ends when one player's entire row is empty; remaining seeds go to whoever still has them. The bot uses minimax at depth 4.`,
  settings,
  initialState: (seed: number, s: OwareSettings) => initialState(seed, s),
  reducer,
  isTerminal,
    hint: (state): HintTarget | null => {
    if (state.winner !== null || state.turn !== 0) return null;
    for (let i = 0; i < 6; i++) {
      if ((state.pits[i] ?? 0) > 0) {
        return { selector: `[data-testid="oware-pit-${i}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: Oware,
};
