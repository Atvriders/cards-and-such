import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { YahtzeeFreeForAllState, YahtzeeFreeForAllAction, YahtzeeFreeForAllSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const YahtzeeFreeForAllGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.YahtzeeFreeForAllGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const yahtzeeFreeForAllPlugin: GamePlugin<YahtzeeFreeForAllState, YahtzeeFreeForAllAction, typeof settings> = {
  id: "yahtzee-free-for-all",
  title: "Yahtzee Free-For-All",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Competitive Yahtzee — claim the section that fits this turn.",
  howToPlay: "Yahtzee Free-For-All is the 2014 Hasbro variant where every round all five dice are visible and players race to claim a scoring section before the timer runs out. Across 13 rounds five dice are rolled. You must call which section the roll best fits: Aces (three or more 1s) pays +15, Sixes (three or more 6s) pays +30, Pairs (two distinct pairs in the same roll) pays +12, or Skip if nothing fits. Wrong call scores zero. Sixes pays best because three sixes alone is harder to roll than three ones in random play (both are equally likely, but six is more competitive in actual Yahtzee scoring because it climbs the upper-section bonus faster). Strategy: read the roll quickly, claim Sixes when the row has three or more, fall back to Pairs as the steady earner. Top score after 13 rounds wins. Average expected score is roughly 145 points.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as YahtzeeFreeForAllSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-yahtzee-free-for-all-next"]', pulses: 3 };
  },
  component: YahtzeeFreeForAllGame,
};
