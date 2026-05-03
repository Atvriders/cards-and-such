import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DudakDiceState, DudakDiceAction, DudakDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DudakDiceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DudakDiceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dudakDicePlugin: GamePlugin<DudakDiceState, DudakDiceAction, typeof settings> = {
  id: "dudak-dice",
  title: "Dudak Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turkish tavern dice — predict Lip (low pair), Top (high), or Mid.",
  howToPlay: "Dudak (Turkish for \"lip\") is a tavern dice game named for the rim of the dice cup. Two dice roll each round and you predict which of three regions the result lands in: Lip (any pair from 1-1 through 3-3, the low pairs), Top (sum of 10 or higher), or Mid (everything else).\n\nLip occurs on 3 of 36 outcomes (8.3%) and pays 50. Top occurs on 6 of 36 outcomes (16.7%) and pays 25. Mid covers 27 of 36 outcomes (75%) and pays 6. Expected value: Lip 4.2, Top 4.2, Mid 4.5 — almost identical, making each call viable.\n\nThe game runs 12 rounds. Mid is the steady payer; Top hits often enough to keep the score line climbing; Lip is the spike. Average expected score lands near 60 points. A run of Lips lifts the score sharply. There are no rerolls — pure prediction across the seeded sequence determines your final total.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DudakDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-dudak-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-dudak-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-dudak-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-dudak-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dudak-dice-next"]', pulses: 3 };
  },
  component: DudakDiceGame,
};
