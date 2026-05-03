import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CleverSpringState, CleverSpringAction, CleverSpringSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CleverSpringGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CleverSpringGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cleverSpringPlugin: GamePlugin<CleverSpringState, CleverSpringAction, typeof settings> = {
  id: "clever-spring",
  title: "Clever Spring",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spring Clever — pink/yellow track-filling with bloom bonuses.",
  howToPlay: `Clever Spring is a Clever-style dice game with 4 tracks.

How to play
1. Roll 5 dice.
2. Pick one die.
3. Add to any of the 4 colored tracks (A, B, C, D). Tracks fill left-to-right.
4. Score = die value + chain bonus (+2 if previous track cell has same value).

Theme: Rolls 6: bloom bonus +4.

End-of-game bonuses
- Each fully completed track: +5
- All 4 tracks reach at least 3 cells: +6

The game runs 10 rolls. Aim for balanced track filling — chasing one track leaves bonuses on the table.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as CleverSpringSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
    if (phase === "rolled") return { selector: '[data-testid="hint-target-clever-spring-pick"]', pulses: 3 };
    if (phase === "picking") return { selector: '[data-testid="hint-target-clever-spring-pick"]', pulses: 3 };
    if (phase === "selecting") return { selector: '[data-testid="hint-target-clever-spring-pick"]', pulses: 3 };
    if (phase === "choosing") return { selector: '[data-testid="hint-target-clever-spring-pick"]', pulses: 3 };
    if (phase === "placing") return { selector: '[data-testid="hint-target-clever-spring-place"]', pulses: 3 };
    if (phase === "place") return { selector: '[data-testid="hint-target-clever-spring-place"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-clever-spring-roll"]', pulses: 3 };
  },
  component: CleverSpringGame,
};
