import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MeyerDiceState, MeyerDiceAction, MeyerDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MeyerDiceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MeyerDiceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const meyerDicePlugin: GamePlugin<MeyerDiceState, MeyerDiceAction, typeof settings> = {
  id: "meyer-dice",
  title: "Meyer Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scandinavian rank-bluff two-dice game; predict rank tier of next roll.",
  howToPlay: "Meyer is a Scandinavian pub bluff dice game where players pass two dice in a cup, each calling a rank that must beat the previous. This solo version asks you to predict the rank tier of the next two-dice roll: Meyer (1-2 or 2-1, the highest), Pair (any matching dice), or Plain (everything else).\n\nMeyer is the rarest combination — only 2 of 36 outcomes (5.6%) — so it pays a hefty 70 points. Pair covers 6 of 36 outcomes excluding Meyer and pays 25. Plain covers the other 28 outcomes and pays 5. Twelve rounds run before the game ends.\n\nIn the original tavern game, calling Meyer is a brag that opponents must lift the cup to challenge. Here you're racing the math. Patience pays — but if you keep calling Plain you'll cap out near 60 points, and one Meyer hit lifts you above that. Average scores hover around 90 points.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MeyerDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-meyer-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-meyer-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-meyer-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-meyer-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-meyer-dice-next"]', pulses: 3 };
  },
  component: MeyerDiceGame,
};
