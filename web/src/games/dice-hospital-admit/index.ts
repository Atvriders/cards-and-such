import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DiceHospitalAdmitState, DiceHospitalAdmitAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceHospitalAdmit = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceHospitalAdmit as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const diceHospitalAdmitPlugin: GamePlugin<DiceHospitalAdmitState, DiceHospitalAdmitAction, typeof settings> = {
  id: "dice-hospital-admit",
  title: "Dice Hospital Admit",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Patient admission roll-and-write — pip values represent health.",
  howToPlay: "Dice Hospital Admit is a quick solo dice game. Patient admission roll-and-write — pip values represent health. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice; pair them as 'patients' — each pair scores higher when sum is balanced (around 7).\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-dice-hospital-admit-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-dice-hospital-admit-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-dice-hospital-admit-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-dice-hospital-admit-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-dice-hospital-admit-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-dice-hospital-admit-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-dice-hospital-admit-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-hospital-admit-roll"]', pulses: 3 };
  },
  component: DiceHospitalAdmit,
};
