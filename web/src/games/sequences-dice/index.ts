import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SequencesDiceState, SequencesDiceAction, SequencesDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SequencesDiceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SequencesDiceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sequencesDicePlugin: GamePlugin<SequencesDiceState, SequencesDiceAction, typeof settings> = {
  id: "sequences-dice",
  title: "Sequences Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict whether two dice show consecutive numbers, repeats, or a gap.",
  howToPlay: "Sequences Dice is a streamlined version of the classic Sequences pub game. Each round you call which kind of result two dice will show: Consecutive (the two dice differ by exactly 1), Repeat (matching dice, like a pair), or Gap (any difference of 2 or more).\n\nConsecutive happens on 10 of 36 outcomes (27.8%) and pays 25. Repeat happens on 6 of 36 outcomes (16.7%) and pays 35. Gap happens on 20 of 36 outcomes (55.5%) and pays 10. The expected value of each call is similar — Consecutive 6.94, Repeat 5.83, Gap 5.55 — so the game rewards reading streaks and accepting variance.\n\nThe game ends after 12 rounds. Your final score combines the rounds you called correctly. There are no rerolls; the seeded RNG determines each roll. Average expected score lands near 80 points; chasing Repeats can spike you above 130 if luck is on your side.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SequencesDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-sequences-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-sequences-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-sequences-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-sequences-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-sequences-dice-next"]', pulses: 3 };
  },
  component: SequencesDiceGame,
};
