import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpinDiceState, SpinDiceAction, SpinDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpinDiceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpinDiceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spinDicePlugin: GamePlugin<SpinDiceState, SpinDiceAction, typeof settings> = {
  id: "spin-dice",
  title: "Spin Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wheel-style dice. Predict if dice will spin to a Solo, Pair, or Run.",
  howToPlay: "Spin Dice imagines two dice spinning like roulette wheels. Each round you predict whether they'll come to rest as a Solo (sum 2 or 12, the extreme outcomes), a Pair (matching dice not at the extremes), or a Run (consecutive numbers like 3-4 or 5-6).\n\nSolo covers 2 of 36 outcomes (5.5%) and pays 80. Pair covers 4 of 36 outcomes (11.1%) and pays 40. Run covers 10 of 36 outcomes (27.8%) and pays 18. Expected value: Solo 4.4, Pair 4.4, Run 5.0 — Run holds a slight edge, but Solo's 80-point spike makes it the high-variance favorite.\n\nThe game runs 12 rounds. Average expected score hovers near 65 points. Stacking Run calls is the safe-and-steady line; mixing in Pair calls adds modest variance; calling Solo more than once or twice exposes you to dry streaks but keeps the leaderboard within reach. Spin Dice is a compact lesson in expected value vs. variance.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpinDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-spin-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-spin-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-spin-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-spin-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-spin-dice-next"]', pulses: 3 };
  },
  component: SpinDiceGame,
};
