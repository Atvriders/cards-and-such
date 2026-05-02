import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RingThrowerState, RingThrowerAction, RingThrowerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RingThrowerGame } from "./Game.js";

export const ringThrowerSettings = {} as const;

export const ringThrowerPlugin: GamePlugin<
  RingThrowerState,
  RingThrowerAction,
  typeof ringThrowerSettings
> = {
  id: "ring-thrower",
  title: "Ring Thrower",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Throw rings onto pegs for points. Aim, set power, release. 10 throws.",
  howToPlay: `Throw golden rings onto circular pegs arranged across the board. Each throw involves two timed decisions: angle and power. You get exactly 10 throws per game — make them count!

The dotted aim line swings back and forth automatically. Press Space, tap, or click once to lock in the angle. Then a power bar rises and falls. Press again to lock power and launch the ring. Higher power means the ring travels faster and farther.

Pegs have different sizes and point values. Smaller red pegs score 10 points but are hard to hit. Medium orange pegs score 5, yellow pegs score 3, and large grey pegs score 1. Rings need to land within the peg's circular target zone.

The ring follows a realistic arc affected by gravity — aim higher to compensate for the drop over distance. To hit far pegs, use higher power; for nearby pegs, use lower power so the ring doesn't fly past.

Strategy: early in the game, aim for the high-value small pegs. If you miss a few, pivot to the larger 3-point and 1-point targets to bank some score. A perfect game (hitting all 10 throws on the 10-point peg) scores 100 points.`,
  settings: ringThrowerSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: RingThrowerState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-ring-thrower-action"]', pulses: 3 };
    },
  component: RingThrowerGame,
};
