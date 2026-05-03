import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SequenceSixState, SequenceSixAction, SequenceSixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SequenceSixGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SequenceSixGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sequenceSixPlugin: GamePlugin<SequenceSixState, SequenceSixAction, typeof settings> = {
  id: "sequence-six",
  title: "Sequence to Six",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hunt for low or high runs in four dice.",
  howToPlay: "Sequence to Six is a roll-and-call dice game where players hunt for short runs in a four-dice pool. Across 13 rounds four dice are rolled. Predict: Includes a 1-2-3 run (the values 1, 2, and 3 all appear among the four dice) pays +30, Includes a 4-5-6 run (4, 5, and 6 all present) pays +30, No run (neither set is fully present) pays +8. Each three-value subset hits about 28% of rolls in a four-dice pool. The two run-targets together cover roughly 50% of outcomes (slightly less because both can simultaneously occur). The catch-all 'No run' pays modestly. Wrong call scores zero. Strategy: alternate the two run picks across the thirteen rounds — pure low-run averages about +120, mixing low and high runs averages +200 since the four-dice pool overlaps the two ranges differently. The catch-all is steady but caps near +75. Top score after thirteen rounds wins.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SequenceSixSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-sequence-six-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-sequence-six-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-sequence-six-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-sequence-six-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-sequence-six-next"]', pulses: 3 };
  },
  component: SequenceSixGame,
};
