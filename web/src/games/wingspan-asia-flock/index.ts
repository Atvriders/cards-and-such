import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WingspanAsiaFlockState, WingspanAsiaFlockAction, WingspanAsiaFlockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WingspanAsiaFlockGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WingspanAsiaFlockGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wingspanAsiaFlockPlugin: GamePlugin<WingspanAsiaFlockState, WingspanAsiaFlockAction, typeof settings> = {
  id: "wingspan-asia-flock",
  title: "Wingspan: Asia Flock",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asia birds flock-draft duet mode; pick birds across rounds.",
  howToPlay: "Wingspan: Asia Flock is a card-drafting game inspired by Wingspan's Asia expansion duet mode, where you and an opponent draft Asian bird cards over eight rounds.\n\nEach round, three bird cards appear: pick one and the CPU takes the highest-rank remaining (it's a hungry hawk). Suits represent four habitats — Forest, Wetland, Grassland, and Mountain. Builds across 8 rounds.\n\nScoring per tableau:\n- Sum of bird ranks (1-9 each).\n- +10 per habitat with 3+ birds (flock bonus).\n- +15 additional per habitat with 5+ birds.\n- +5 per pair of same-rank birds; +10 per three-of-a-kind.\n- +25 endgame bonus if you outscore the CPU.\n\nStrategy: lock a habitat early — three Mountain birds is a +10 even at low ranks, often beating raw rank totals. The CPU greedily takes max-rank, so you can deny by reaching for high-rank-of-your-suit. Aim for 60-100 points with the bonus; the duet mode rewards thematic flock-building over rank chasing.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WingspanAsiaFlockSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "drafting") return { selector: '[data-testid="hint-target-wingspan-asia-flock-primary"]', pulses: 3 };
      if (state.phase === "round-done") return { selector: '[data-testid="hint-target-wingspan-asia-flock-next"]', pulses: 3 };
      return null;
    },
  component: WingspanAsiaFlockGame,
};
