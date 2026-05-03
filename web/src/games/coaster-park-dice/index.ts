import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CoasterParkDiceState, CoasterParkDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CoasterParkDice = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CoasterParkDice as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const coasterParkDicePlugin: GamePlugin<CoasterParkDiceState, CoasterParkDiceAction, typeof settings> = {
  id: "coaster-park-dice",
  title: "Coaster Park Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build looping tracks from dice.",
  howToPlay: "Coaster Park Dice is a quick solo dice game. Build looping tracks from dice. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice; chain consecutive dice (4-5-6 etc) score multiplied by length.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-coaster-park-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-coaster-park-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-coaster-park-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-coaster-park-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-coaster-park-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-coaster-park-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-coaster-park-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-coaster-park-dice-roll"]', pulses: 3 };
  },
  component: CoasterParkDice,
};
