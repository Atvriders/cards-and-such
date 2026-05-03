import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StraightOrBustState, StraightOrBustAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StraightOrBust = /* @__PURE__ */ lazy(() => import("./StraightOrBust.js").then((mod) => ({ default: mod.StraightOrBust as unknown as React.ComponentType<unknown> })));
export const straightOrBustSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type StraightOrBustSettingsType = SettingsOf<typeof straightOrBustSettings>;

export const straightOrBustPlugin: GamePlugin<StraightOrBustState, StraightOrBustAction, typeof straightOrBustSettings> = {
  id: "straight-or-bust",
  title: "Straight or Bust",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice up to 3 times per round — build a straight to score, or bust and earn nothing!",
  howToPlay: `Straight or Bust is a fast-paced dice game played over 5, 7, or 10 rounds. Each round your goal is to roll a straight — five consecutive values — with five dice in as few rolls as possible.

On your first roll all five dice are thrown. If you've rolled a straight already you score immediately! Otherwise, click any dice you want to keep — those toward a straight (e.g., a 2, 3, and 4 are great to keep when chasing 1–2–3–4–5) — and click Re-roll to reroll the rest. You may roll a total of three times per round.

Two types of straights score points: the low straight (1–2–3–4–5) scores 150 points, and the high straight (2–3–4–5–6) scores 200 points. Speed bonuses reward efficiency: achieving a straight on the very first roll earns an extra 100 points; achieving it in exactly two rolls earns a 50-point bonus. Rolling all three times and still failing to form a straight scores zero for that round — a bust!

After all rounds, your total score is the sum of all round scores. Aim for the high straight and first-roll bonuses for the biggest totals. The game blends luck with the tactical decision of which dice to hold.`,
  settings: straightOrBustSettings,
  initialState: (seed: number, settings: StraightOrBustSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-straight-or-bust-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-straight-or-bust-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-straight-or-bust-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-straight-or-bust-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-straight-or-bust-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-straight-or-bust-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-straight-or-bust-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-straight-or-bust-roll"]', pulses: 3 };
  },
  component: StraightOrBust,
};
