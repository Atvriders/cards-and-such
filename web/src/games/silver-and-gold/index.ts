import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SilverAndGoldState, SilverAndGoldAction, SilverAndGoldSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SilverAndGoldGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const silverAndGoldPlugin: GamePlugin<SilverAndGoldState, SilverAndGoldAction, typeof settings> = {
  id: "silver-and-gold",
  title: "Silver & Gold",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Treasure cards — fill in shapes on islands for silver and gold bonuses.",
  howToPlay: `Silver & Gold is a 12-roll dice-and-mark game with themed scoring.

How to play
1. Press Roll to throw a d6.
2. Click any unmarked cell on the 4x4 grid to mark it with that value.
3. Score = die value + zone bonus + adjacency bonus (matching value next door).
4. Skip if no good spot — that roll is wasted.

Theme: Filling a shape: +shape size points.

End-of-game bonuses
- Full row: +4 each
- Full column: +4 each
- Full board: +12

The game ends after 12 rolls (or earlier if all 16 cells are filled). Maximum reachable depends on a balanced spread; aim for 50-80 in a strong run.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as SilverAndGoldSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
    if (phase === "marking") return { selector: '[data-testid="hint-target-silver-and-gold-mark"]', pulses: 3 };
    if (phase === "mark") return { selector: '[data-testid="hint-target-silver-and-gold-mark"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-silver-and-gold-roll"]', pulses: 3 };
  },
  component: SilverAndGoldGame,
};
