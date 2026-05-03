import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TumblinFlickState, TumblinFlickAction, TumblinFlickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TumblinFlickGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TumblinFlickGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tumblinFlickPlugin: GamePlugin<TumblinFlickState, TumblinFlickAction, typeof settings> = {
  id: "tumblin-flick",
  title: "Tumblin Flick",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tumblin-Dice flick simulation — final tier determines score.",
  howToPlay: "Tumblin-Dice is a flick-the-dice-down-a-slope game where dice slide into score zones. This adaptation simulates the slope physics with three rolled dice and three scoring tiers. Across 12 rounds three dice are rolled. Predict their sum tier: Top Tier (15-18) pays +30, Middle Tier (10-14) pays +10, Bottom Tier (3-9) pays +18. The middle band is the modal range with roughly 50% of sums; the top tier is rare (around 16%) so it pays a +30 bonus, while the bottom tier hits 34% of the time. Wrong call scores zero. Strategy: bottom-tier-only is the steady earner near +90 across twelve rounds; bold top-tier picks can swing to +150 if you read the dice odds correctly. Twelve rounds, top score wins. The original Tumblin-Dice rewards finger flicking finesse; this variant rewards probability literacy. The 1990s prototype rewarded a steady hand on bar-table flicks.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TumblinFlickSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-tumblin-flick-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-tumblin-flick-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-tumblin-flick-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-tumblin-flick-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-tumblin-flick-next"]', pulses: 3 };
  },
  component: TumblinFlickGame,
};
