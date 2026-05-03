import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MexenPubState, MexenPubAction, MexenPubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MexenPubGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MexenPubGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mexenPubPlugin: GamePlugin<MexenPubState, MexenPubAction, typeof settings> = {
  id: "mexen-pub",
  title: "Mexen Pub",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scandinavian pub bluff. Predict Mexen (2-1), Pair, or Common.",
  howToPlay: "Mexen is a Scandinavian pub bluff dice game closely related to Meyer. In this single-player version, two dice roll each round and you predict the result tier: Mexen (the special 2-1 combination, the highest call), Pair (any matching dice), or Common (everything else).\n\nMexen covers 2 of 36 outcomes (5.5%) and pays 80. Pair covers 6 of 36 outcomes (16.7%) and pays 30. Common covers the remaining 28 outcomes (77.8%) and pays 5. Expected value: Mexen 4.4, Pair 5.0, Common 3.9 — Pair holds a slight edge.\n\nThe game runs 12 rounds. Real Mexen at the bar features bluffing under a cup and chip passing; here the dice are open. Average expected score is near 60 points. Calling Mexen even once or twice during a session adds the chance of a big spike — and missing on a Mexen call costs only the round, not your seat at the table.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MexenPubSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-mexen-pub-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-mexen-pub-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-mexen-pub-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-mexen-pub-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-mexen-pub-next"]', pulses: 3 };
  },
  component: MexenPubGame,
};
