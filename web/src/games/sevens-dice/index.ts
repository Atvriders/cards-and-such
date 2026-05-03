import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevensDiceState, SevensDiceAction, SevensDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SevensDiceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SevensDiceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sevensDicePlugin: GamePlugin<SevensDiceState, SevensDiceAction, typeof settings> = {
  id: "sevens-dice",
  title: "Sevens Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Will two dice sum to exactly 7, near 7 (6 or 8), or far from 7?",
  howToPlay: "Sevens Dice dials in on the most famous total in dice: 7. Each round you call which band the two-dice sum will land in: Exactly 7, Near 7 (sum 6 or 8), or Far (any sum from 2-5 or 9-12).\n\nSeven is the most likely single sum (6 of 36 = 16.7%) and pays 30 points. Near 7 covers 10 of 36 outcomes (27.8%) and pays 18. Far covers 20 of 36 outcomes (55.5%) and pays 8. The expected value of each call is roughly even (5.0, 5.0, 4.4), so the game rewards a balanced approach.\n\nGameplay runs over 12 rounds, no rerolls. Each call commits you to a single outcome band. Score the round, advance, repeat. Average expected score hovers near 60 points. Chasing exact sevens can spike scores above 100 if your sevens hit, but missing two or three in a row is common — a steady mix of calls usually produces a solid finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevensDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-sevens-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-sevens-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-sevens-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-sevens-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-sevens-dice-next"]', pulses: 3 };
  },
  component: SevensDiceGame,
};
